import { DbscanPdfFragmentClusterer } from "@monorepo/core-pdf-dbscan";
import {
  Rectangle,
  type IBoundingBox,
  type PdfFragment,
} from "@monorepo/core-pdf-domain";
import { PdfEngine } from "@monorepo/core-pdf-reader";
import { CorePdfWriter, type IWritePdfFragments } from "@monorepo/core-pdf-writer";
import { PDFDocument, rgb } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

type ClusterFragment = {
  readonly id: string;
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
};

type ApplicationCluster = {
  readonly id: string;
  readonly items: readonly PdfFragment[];
};

type MidpointProjection = {
  readonly fragments: readonly PdfFragment[];
  readonly originalByProjected: ReadonlyMap<PdfFragment, PdfFragment>;
};

type BoxSize = {
  readonly width: number;
  readonly height: number;
};

const SourcePdfPath =
  "C:\\Users\\danha\\source\\repos\\HTML\\MonoRepro\\packages\\core-pdf-reader\\tests\\Selfmade\\save-1776969325465.pdf";

const Dbscan = {
  eps: 260,
  minPts: 2,
} as const;

const ClusterDrawing = {
  borderWidth: 4,
  color: rgb(0.0, 0.2, 1.0),
  dashArray: [12, 6] as const,
  labelSize: 10,
  labelOffsetY: 8,
} as const;

const ClusterBoxPolicy = {
  growthRatio: 0.1,

  fallbackWidth: 208.52632141113287,
  fallbackHeight: 186.23529052734375,

  referenceMinWidth: 160,
  referenceMinHeight: 120,

  singletonMaxWidth: 160,
  singletonMaxHeight: 80,
} as const;

class ClusterPdfApplication {
  public constructor(
    private readonly pdfEngine: PdfEngine,
    private readonly clusterer: DbscanPdfFragmentClusterer,
    private readonly midpointProjector: MidpointProjector,
    private readonly clusterAssembler: ClusterAssembler,
    private readonly clusterFragmentFactory: ClusterFragmentFactory,
    private readonly writer: CorePdfWriter<ClusterFragment>,
  ) {}

  public async run(sourcePath: string, outputPath: string): Promise<void> {
    const binary = await readFile(sourcePath);
    const originalFragments = await this.pdfEngine.readFragments(binary);

    const projection = this.midpointProjector.project(originalFragments);

    const dbscanResult = this.clusterer.cluster(
      projection.fragments,
      Dbscan.eps,
      Dbscan.minPts,
    );

    const clusters = this.clusterAssembler.assemble(
      dbscanResult.clusters,
      dbscanResult.noise,
    );

    const clusterFragments = this.clusterFragmentFactory.create(
      clusters,
      projection.originalByProjected,
      originalFragments,
    );

    const resultPdf = await this.writer.write(binary, clusterFragments);

    await writeFile(outputPath, resultPdf);

    console.log(`Saved: ${outputPath}`);
  }
}

class MidpointProjector {
  public project(fragments: readonly PdfFragment[]): MidpointProjection {
    const originalByProjected = new Map<PdfFragment, PdfFragment>();

    const projectedFragments = fragments.map((fragment) => {
      const projected = this.toMidpoint(fragment);

      originalByProjected.set(projected, fragment);

      return projected;
    });

    return {
      fragments: Object.freeze(projectedFragments),
      originalByProjected,
    };
  }

  private toMidpoint(fragment: PdfFragment): PdfFragment {
    const rectangle = PdfRect.fromFragment("midpoint-source", fragment);
    const center = rectangle.center;

    return {
      ...fragment,
      boundingBox: {
        position: {
          x: center.x,
          y: center.y,
        },
        width: 0,
        height: 0,
      },
    };
  }
}

class ClusterAssembler {
  public assemble(
    denseClusters: readonly ApplicationCluster[],
    noise: readonly PdfFragment[],
  ): readonly ApplicationCluster[] {
    return Object.freeze([
      ...denseClusters,
      ...noise.map((fragment, index): ApplicationCluster => ({
        id: `cluster-${denseClusters.length + index + 1}`,
        items: Object.freeze([fragment]),
      })),
    ]);
  }
}

class ClusterFragmentFactory {
  public constructor(
    private readonly originalResolver: OriginalFragmentResolver,
    private readonly referenceBoxResolver: ReferenceBoxResolver,
    private readonly boxPolicy: ClusterBoxFactory,
    private readonly guard: ClusterBoxGuard,
  ) {}

  public create(
    clusters: readonly ApplicationCluster[],
    originalByProjected: ReadonlyMap<PdfFragment, PdfFragment>,
    originalFragments: readonly PdfFragment[],
  ): readonly ClusterFragment[] {
    const referenceSize = this.referenceBoxResolver.resolve(originalFragments);

    return Object.freeze(
      clusters.map((cluster) =>
        this.createOne(cluster, originalByProjected, referenceSize),
      ),
    );
  }

  private createOne(
    cluster: ApplicationCluster,
    originalByProjected: ReadonlyMap<PdfFragment, PdfFragment>,
    referenceSize: BoxSize,
  ): ClusterFragment {
    const originals = cluster.items.map((projected) =>
      this.originalResolver.resolve(cluster.id, projected, originalByProjected),
    );

    const clusterRectangle = this.boxPolicy.create(
      cluster.id,
      originals,
      referenceSize,
    );

    this.guard.ensureContains(cluster.id, clusterRectangle, originals);

    return {
      id: cluster.id,
      pageNumber: originals[0]!.pageNumber,
      boundingBox: clusterRectangle.toBoundingBox(),
    };
  }
}

class OriginalFragmentResolver {
  public resolve(
    clusterId: string,
    projected: PdfFragment,
    originalByProjected: ReadonlyMap<PdfFragment, PdfFragment>,
  ): PdfFragment {
    const original = originalByProjected.get(projected);

    if (original === undefined) {
      throw new Error(`Missing original fragment for '${clusterId}'.`);
    }

    return original;
  }
}

class ReferenceBoxResolver {
  public resolve(fragments: readonly PdfFragment[]): BoxSize {
    const referenceBoxes = fragments
      .map((fragment) => fragment.boundingBox)
      .filter(
        (box) =>
          box.width >= ClusterBoxPolicy.referenceMinWidth &&
          box.height >= ClusterBoxPolicy.referenceMinHeight,
      );

    if (referenceBoxes.length === 0) {
      return {
        width: ClusterBoxPolicy.fallbackWidth,
        height: ClusterBoxPolicy.fallbackHeight,
      };
    }

    return {
      width: Numeric.median(referenceBoxes.map((box) => box.width)),
      height: Numeric.median(referenceBoxes.map((box) => box.height)),
    };
  }
}

class ClusterBoxFactory {
  public create(
    clusterId: string,
    fragments: readonly PdfFragment[],
    referenceSize: BoxSize,
  ): Rectangle {
    if (fragments.length === 0) {
      throw new Error(`Cluster '${clusterId}' has no fragments.`);
    }

    const union = PdfRect.union(
      clusterId,
      fragments.map((fragment) => PdfRect.fromFragment(clusterId, fragment)),
    );

    const base =
      fragments.length === 1 && this.isSingletonTextSized(union)
        ? PdfRect.centered(clusterId, union.center, referenceSize)
        : union;

    return base.inflate(
      (base.width * ClusterBoxPolicy.growthRatio) / 2,
      (base.height * ClusterBoxPolicy.growthRatio) / 2,
    );
  }

  private isSingletonTextSized(rectangle: Rectangle): boolean {
    return (
      rectangle.width <= ClusterBoxPolicy.singletonMaxWidth &&
      rectangle.height <= ClusterBoxPolicy.singletonMaxHeight
    );
  }
}

class ClusterBoxGuard {
  public ensureContains(
    clusterId: string,
    clusterRectangle: Rectangle,
    fragments: readonly PdfFragment[],
  ): void {
    for (const fragment of fragments) {
      const fragmentRectangle = PdfRect.fromFragment(clusterId, fragment);

      if (!PdfRect.containsRectangle(clusterRectangle, fragmentRectangle)) {
        throw new Error(`Cluster '${clusterId}' does not encapsulate its fragment.`);
      }
    }
  }
}

class ClusterPdfFragmentWriter implements IWritePdfFragments<ClusterFragment> {
  public async write(
    pdfBinary: Uint8Array,
    fragments: readonly ClusterFragment[],
  ): Promise<Uint8Array> {
    const document = await PDFDocument.load(pdfBinary);

    for (const fragment of fragments) {
      this.draw(document, fragment);
    }

    return document.save();
  }

  private draw(document: PDFDocument, fragment: ClusterFragment): void {
    const page = document.getPage(fragment.pageNumber - 1);
    const box = fragment.boundingBox;

    const x = box.position.x;
    const y = page.getHeight() - box.position.y - box.height;

    page.drawRectangle({
      x,
      y,
      width: box.width,
      height: box.height,
      borderWidth: ClusterDrawing.borderWidth,
      borderColor: ClusterDrawing.color,
      borderDashArray: [...ClusterDrawing.dashArray],
    });

    page.drawText(`cluster id: ${fragment.id}`, {
      x,
      y: y + box.height + ClusterDrawing.labelOffsetY,
      size: ClusterDrawing.labelSize,
      color: ClusterDrawing.color,
    });
  }
}

class PdfRect {
  public static fromFragment(id: string, fragment: PdfFragment): Rectangle {
    return this.fromBox(id, fragment.boundingBox);
  }

  public static fromBox(id: string, box: IBoundingBox): Rectangle {
    return Rectangle.create({
      id,
      position: box.position,
      width: box.width,
      height: box.height,
    });
  }

  public static union(id: string, rectangles: readonly Rectangle[]): Rectangle {
    return Rectangle.union(id, rectangles);
  }

  public static centered(
    id: string,
    center: { readonly x: number; readonly y: number },
    size: BoxSize,
  ): Rectangle {
    return Rectangle.create({
      id,
      position: {
        x: center.x - size.width / 2,
        y: center.y - size.height / 2,
      },
      width: size.width,
      height: size.height,
    });
  }

  public static containsRectangle(container: Rectangle, content: Rectangle): boolean {
    return (
      container.left <= content.left &&
      container.top <= content.top &&
      container.right >= content.right &&
      container.bottom >= content.bottom
    );
  }
}

class Numeric {
  public static median(values: readonly number[]): number {
    if (values.length === 0) {
      throw new Error("Cannot calculate median for an empty collection.");
    }

    const sorted = [...values].sort((left, right) => left - right);
    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 1
      ? sorted[middle]!
      : (sorted[middle - 1]! + sorted[middle]!) / 2;
  }
}

function buildApplication(): ClusterPdfApplication {
  return new ClusterPdfApplication(
    new PdfEngine(),
    new DbscanPdfFragmentClusterer(),
    new MidpointProjector(),
    new ClusterAssembler(),
    new ClusterFragmentFactory(
      new OriginalFragmentResolver(),
      new ReferenceBoxResolver(),
      new ClusterBoxFactory(),
      new ClusterBoxGuard(),
    ),
    new CorePdfWriter<ClusterFragment>(new ClusterPdfFragmentWriter()),
  );
}

function resolveOutputPath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "result.pdf");
}

await buildApplication()
  .run(SourcePdfPath, resolveOutputPath())
  .catch((error: unknown) => {
    console.error("Fatal:", error);
    process.exitCode = 1;
  });