import {
  DbscanPdfFragmentClusterer,
  type IPdfFragmentCluster,
} from "@monorepo/core-pdf-dbscan";
import {
  FragmentKinds,
  type IBoundingBox,
  type PdfFragment,
} from "@monorepo/core-pdf-domain";
import { PdfEngine } from "@monorepo/core-pdf-reader";
import { PDFDocument, rgb } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type ClusterFragment = {
  readonly id: string;
  readonly pageNumber: number;
  readonly sourceIndexes: readonly number[];
  readonly boundingBox: IBoundingBox;
};

const sourcePdfPath =
  "C:\\Users\\danha\\source\\repos\\HTML\\MonoRepro\\packages\\core-pdf-reader-app\\nodejs\\src\\test2.pdf";

const outputDirectory = dirname(fileURLToPath(import.meta.url));
const outputJsonPath = join(outputDirectory, "clusters.json");
const outputPdfPath = join(outputDirectory, "result.pdf");

const binary = await readFile(sourcePdfPath);
const fragments = await new PdfEngine().readFragments(binary);
const rectangles = fragments.filter((x) => x.kind === FragmentKinds.Rectangle);

const sourceIndexByFragment = new Map<PdfFragment, number>();
fragments.forEach((fragment, index) => sourceIndexByFragment.set(fragment, index));

const result = new DbscanPdfFragmentClusterer().cluster(rectangles, 96, 2);
const clusterFragments = result.clusters.map((cluster) =>
  toClusterFragment(cluster, sourceIndexByFragment),
);

await writeFile(outputJsonPath, JSON.stringify(clusterFragments, null, 2), "utf8");
await writeFile(outputPdfPath, await drawClusters(binary, clusterFragments));

console.log(
  JSON.stringify(
    {
      rectangleCount: rectangles.length,
      clusterCount: clusterFragments.length,
      outputPdfPath,
      outputJsonPath,
    },
    null,
    2,
  ),
);

function toClusterFragment(
  cluster: IPdfFragmentCluster<PdfFragment>,
  sourceIndexByFragment: ReadonlyMap<PdfFragment, number>,
): ClusterFragment {
  if (cluster.items.length === 0) {
    throw new Error(`Cluster '${cluster.id}' has no items.`);
  }

  return {
    id: cluster.id,
    pageNumber: cluster.items[0]!.pageNumber,
    sourceIndexes: cluster.items.map((x) => sourceIndexByFragment.get(x) ?? -1),
    boundingBox: unionBoundingBoxes(cluster.items.map((x) => x.boundingBox)),
  };
}

function unionBoundingBoxes(boxes: readonly IBoundingBox[]): IBoundingBox {
  const left = Math.min(...boxes.map((x) => x.position.x));
  const top = Math.min(...boxes.map((x) => x.position.y));
  const right = Math.max(...boxes.map((x) => x.position.x + x.width));
  const bottom = Math.max(...boxes.map((x) => x.position.y + x.height));

  return {
    position: { x: left - 8, y: top - 8 },
    width: right - left + 16,
    height: bottom - top + 16,
  };
}

async function drawClusters(
  pdfBinary: Uint8Array,
  clusters: readonly ClusterFragment[],
): Promise<Uint8Array> {
  const document = await PDFDocument.load(pdfBinary);

  for (const cluster of clusters) {
    const page = document.getPage(cluster.pageNumber - 1);
    const box = cluster.boundingBox;

    page.drawRectangle({
      x: box.position.x,
      y: page.getHeight() - box.position.y - box.height,
      width: box.width,
      height: box.height,
      borderWidth: 4,
      borderColor: rgb(0, 0.2, 1),
      borderDashArray: [12, 6],
    });
  }

  return document.save();
}