// src/index.ts

import type { PdfFragment } from "@monorepo/core-pdf-domain";
import { DbscanPdfFragmentClusterer } from "@monorepo/core-pdf-dbscan";
import { Plot } from "./plot.js";
import { RandomPdfFragmentGenerator } from "./RandomPdfFragmentGenerator.js";

type AxisRange = {
  readonly x: readonly [number, number];
  readonly y: readonly [number, number];
};

interface DemoOptions {
  readonly outputFileName: string;
  readonly epsilon: number;
  readonly minPoints: number;
  readonly axisPadding: number;
  readonly randomFragmentCount: number;
}

class PdfFragmentFactory {
  public rectangle(x: number, y: number): PdfFragment {
    return {
      kind: "rectangle",
      pageNumber: 1,
      boundingBox: {
        position: { x, y },
        width: 1,
        height: 1,
      },
    };
  }

  public cross(translateX: number): readonly PdfFragment[] {
    return [
      this.rectangle(-2 + translateX, 0),
      this.rectangle(0 + translateX, 2),
      this.rectangle(0 + translateX, -2),
      this.rectangle(2 + translateX, 0),
    ];
  }
}

class PdfFragmentAxisRangeCalculator {
  public calculate(
    fragments: readonly PdfFragment[],
    padding: number,
  ): AxisRange {
    if (fragments.length === 0) {
      return {
        x: [-1, 1],
        y: [1, -1],
      };
    }

    const minX = Math.min(
      ...fragments.map((fragment) => fragment.boundingBox.position.x),
    );

    const minY = Math.min(
      ...fragments.map((fragment) => fragment.boundingBox.position.y),
    );

    const maxX = Math.max(
      ...fragments.map(
        (fragment) =>
          fragment.boundingBox.position.x + fragment.boundingBox.width,
      ),
    );

    const maxY = Math.max(
      ...fragments.map(
        (fragment) =>
          fragment.boundingBox.position.y + fragment.boundingBox.height,
      ),
    );

    return {
      x: [minX - padding, maxX + padding],
      y: [maxY + padding, minY - padding],
    };
  }
}

class PdfDbscanPlotDemoApplication {
  public constructor(
    private readonly options: DemoOptions,
    private readonly fragmentFactory: PdfFragmentFactory,
    private readonly randomFragmentGenerator: RandomPdfFragmentGenerator,
    private readonly axisRangeCalculator: PdfFragmentAxisRangeCalculator,
    private readonly clusterer: DbscanPdfFragmentClusterer,
    private readonly plot: Plot,
  ) {}

  public run(): void {
    const fragments = this.createFragments();

    const result = this.clusterer.cluster(
      fragments,
      this.options.epsilon,
      this.options.minPoints,
    );

    const axisRange = this.axisRangeCalculator.calculate(
      fragments,
      this.options.axisPadding,
    );

    this.logInput(fragments, result.clusters.length, axisRange);

    const outputPath = this.plot.write(
      this.options.outputFileName,
      fragments,
      result.clusters,
      axisRange,
    );

    console.log({ outputPath });
  }

  private createFragments(): readonly PdfFragment[] {
    return [
      ...this.fragmentFactory.cross(0),
      ...this.fragmentFactory.cross(12),
      ...this.randomFragmentGenerator.many(this.options.randomFragmentCount),
    ];
  }

  private logInput(
    fragments: readonly PdfFragment[],
    clusterCount: number,
    axisRange: AxisRange,
  ): void {
    console.log({
      fragmentCount: fragments.length,
      clusterCount,
      epsilon: this.options.epsilon,
      minPoints: this.options.minPoints,
      randomFragmentCount: this.options.randomFragmentCount,
      axisRange,
    });

    console.table(
      fragments.map((fragment, index) => ({
        index,
        x: fragment.boundingBox.position.x,
        y: fragment.boundingBox.position.y,
        right: fragment.boundingBox.position.x + fragment.boundingBox.width,
        bottom: fragment.boundingBox.position.y + fragment.boundingBox.height,
      })),
    );
  }
}

const app = new PdfDbscanPlotDemoApplication(
  {
    outputFileName: "two-groups-plus-20-random-fragments.html",
    epsilon: 3,
    minPoints: 1,
    axisPadding: 2,
    randomFragmentCount: 20,
  },
  new PdfFragmentFactory(),
  new RandomPdfFragmentGenerator({
    minX: 20,
    maxX: 30,
    minY: 1,
    maxY: 4,
    width: 1,
    height: 1,
  }),
  new PdfFragmentAxisRangeCalculator(),
  new DbscanPdfFragmentClusterer(),
  new Plot(),
);

app.run();