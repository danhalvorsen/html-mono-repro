// src/plot.ts

import type { PdfFragment } from "@monorepo/core-pdf-domain";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

interface AxisRange {
  readonly x: readonly [number, number];
  readonly y: readonly [number, number];
}

interface PdfFragmentPlotCluster {
  readonly id: string;
  readonly items: readonly PdfFragment[];
}

interface PlotShape {
  readonly type: "rect";
  readonly xref: "x";
  readonly yref: "y";
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
  readonly line: {
    readonly width: number;
    readonly dash: "solid" | "dash";
  };
}

export class Plot {
  public write(
    fileName: string,
    fragments: readonly PdfFragment[],
    clusters: readonly PdfFragmentPlotCluster[],
    axisRange?: AxisRange,
  ): string {
    const clusterBoxes = clusters.map((cluster) =>
      this.clusterBox(cluster.items),
    );

    const shapes: readonly PlotShape[] = [
      ...fragments.map((fragment) => this.rectangle(fragment, 2, "solid")),
      ...clusterBoxes.map((box) => this.rectangle(box, 5, "dash")),
    ];

    const range = axisRange ?? this.range([...fragments, ...clusterBoxes]);
    const centerTrace = this.centerTrace(fragments);

    const outputDirectory = resolve(process.cwd(), ".output", "plots");
    mkdirSync(outputDirectory, { recursive: true });

    const outputPath = resolve(outputDirectory, fileName);
    writeFileSync(outputPath, this.html(centerTrace, shapes, range), "utf8");

    return outputPath;
  }

  private rectangle(
    fragment: PdfFragment,
    width: number,
    dash: "solid" | "dash",
  ): PlotShape {
    const x0 = fragment.boundingBox.position.x;
    const y0 = fragment.boundingBox.position.y;

    return {
      type: "rect",
      xref: "x",
      yref: "y",
      x0,
      y0,
      x1: x0 + fragment.boundingBox.width,
      y1: y0 + fragment.boundingBox.height,
      line: {
        width,
        dash,
      },
    };
  }

  private centerTrace(fragments: readonly PdfFragment[]): object {
    return {
      type: "scatter",
      mode: "markers+text",
      name: "Fragments",
      x: fragments.map((fragment) => this.centerX(fragment)),
      y: fragments.map((fragment) => this.centerY(fragment)),
      text: fragments.map((_fragment, index) => `F${index}`),
      textposition: "top center",
      marker: {
        size: 8,
      },
    };
  }

  private clusterBox(items: readonly PdfFragment[]): PdfFragment {
    if (items.length === 0) {
      throw new Error("Cannot create plot cluster box from an empty cluster.");
    }

    const left = Math.min(
      ...items.map((item) => item.boundingBox.position.x),
    );

    const top = Math.min(
      ...items.map((item) => item.boundingBox.position.y),
    );

    const right = Math.max(
      ...items.map(
        (item) => item.boundingBox.position.x + item.boundingBox.width,
      ),
    );

    const bottom = Math.max(
      ...items.map(
        (item) => item.boundingBox.position.y + item.boundingBox.height,
      ),
    );

    return {
      kind: "rectangle",
      pageNumber: items[0]?.pageNumber ?? 1,
      boundingBox: {
        position: {
          x: left,
          y: top,
        },
        width: right - left,
        height: bottom - top,
      },
    };
  }

  private range(fragments: readonly PdfFragment[]): AxisRange {
    if (fragments.length === 0) {
      return {
        x: [-1, 1],
        y: [1, -1],
      };
    }

    const left = Math.min(
      ...fragments.map((fragment) => fragment.boundingBox.position.x),
    );

    const top = Math.min(
      ...fragments.map((fragment) => fragment.boundingBox.position.y),
    );

    const right = Math.max(
      ...fragments.map(
        (fragment) =>
          fragment.boundingBox.position.x + fragment.boundingBox.width,
      ),
    );

    const bottom = Math.max(
      ...fragments.map(
        (fragment) =>
          fragment.boundingBox.position.y + fragment.boundingBox.height,
      ),
    );

    const padding = 2;

    return {
      x: [left - padding, right + padding],
      y: [bottom + padding, top - padding],
    };
  }

  private centerX(fragment: PdfFragment): number {
    return fragment.boundingBox.position.x + fragment.boundingBox.width / 2;
  }

  private centerY(fragment: PdfFragment): number {
    return fragment.boundingBox.position.y + fragment.boundingBox.height / 2;
  }

  private html(
    centerTrace: object,
    shapes: readonly PlotShape[],
    range: AxisRange,
  ): string {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
</head>
<body>
  <div id="plot" style="width:100%;height:900px"></div>

  <script>
    const data = ${JSON.stringify([centerTrace])};
    const layout = {
      title: "PDF Fragment Plot",
      xaxis: {
        range: ${JSON.stringify(range.x)},
        autorange: false,
        dtick: 1,
        zeroline: true
      },
      yaxis: {
        range: ${JSON.stringify(range.y)},
        autorange: false,
        dtick: 1,
        zeroline: true
      },
      shapes: ${JSON.stringify(shapes)},
      showlegend: true
    };

    console.log("[Plot]", {
      markerCount: data[0].x.length,
      shapeCount: layout.shapes.length,
      xRange: layout.xaxis.range,
      yRange: layout.yaxis.range
    });

    Plotly.newPlot("plot", data, layout, {
      responsive: true,
      scrollZoom: true
    });
  </script>
</body>
</html>`;
  }
}