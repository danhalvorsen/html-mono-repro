import type { PdfFragment } from "@monorepo/core-pdf-domain";
import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { DbscanPdfFragmentClusterer } from "../../src/code.js";
import { Fixture } from "./unit-tests.test.js";

const data = new Fixture();

describe("DbscanPdfFragmentClusterer cross fragments", () => {
  const sut = new DbscanPdfFragmentClusterer();
  const points: readonly PdfFragment[] = [...data.cross()];

  it("should create four clusters when epsilon is too small", () => {
    const epsilon = 0.2;
    const minPoints = 1;

    writeOptionalPlot("cross-eps-0_2.html", points);

    const result = sut.cluster(points, epsilon, minPoints);

    expect(result.clusters.length).toBe(4);
  });

  it("should create one cluster when epsilon connects the cross", () => {
    const epsilon = 3;
    const minPoints = 1;

    writeOptionalPlot("cross-eps-3.html", points);

    const result = sut.cluster(points, epsilon, minPoints);

    expect(result.clusters.length).toBe(1);
  });
});

function writeOptionalPlot(
  fileName: string,
  fragments: readonly PdfFragment[],
): void {
  if (process.env.PLOT_PDF_FRAGMENTS !== "1") {
    return;
  }

  const outputDirectory = resolve(process.cwd(), ".test-output", "plots");
  mkdirSync(outputDirectory, { recursive: true });

  const outputPath = resolve(outputDirectory, fileName);

  writeFileSync(outputPath, createPlotHtml(fragments), "utf8");

  console.log(`Plot written: ${outputPath}`);
}

function createPlotHtml(fragments: readonly PdfFragment[]): string {
  const x = fragments.map((p) => p.boundingBox.position.x);
  const y = fragments.map((p) => p.boundingBox.position.y);
  const text = fragments.map((p) => `#${p.index}`);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>PDF Fragment Plot</title>
  <script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
</head>
<body>
  <div id="plot" style="width: 900px; height: 700px;"></div>

  <script>
    Plotly.newPlot("plot", [{
      type: "scatter",
      mode: "markers+text",
      x: ${JSON.stringify(x)},
      y: ${JSON.stringify(y)},
      text: ${JSON.stringify(text)},
      textposition: "top center",
      marker: { size: 12 }
    }], {
      title: "PDF fragments",
      xaxis: { title: "x", zeroline: true },
      yaxis: { title: "y", zeroline: true, autorange: "reversed" }
    });
  </script>
</body>
</html>`;
}