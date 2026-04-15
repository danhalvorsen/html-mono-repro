// packages/core-pdf-reader/tests/engine.page1.clusters.integration.test.ts

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { IPdfTextFragment } from "../src/IPdfTextFragment.js";
import { CompositePdfEngine } from "../src/engine/CompositePdfEngine.js";
import {
  PdfTextFragmentBoundingBoxFactory,
  PdfTextFragmentClusterer,
  PdfTextFragmentLineRule,
} from "../src/clustering/PdfTextFragmentClusterer.js";

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").replace(/\s+,/g, ",").trim();
}

describe("CompositePdfEngine (Kiwi.pdf) - page 1 clusters", () => {
  it("should write grouped page 1 clusters as JSON using PdfTextFragmentClusterer", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const outputPath = join(process.cwd(), "tests", "Kiwi.page1.clusters.json");

    const binary = new Uint8Array(await readFile(inputPath));
    const engine = new CompositePdfEngine();

    const fragments =
      (await (engine as any).readTextFragments(binary)) as readonly IPdfTextFragment[];

    const page1 = fragments.filter((f) => f.pageNumber === 1);
    expect(page1.length).toBeGreaterThan(0);

    const boundingBoxFactory = new PdfTextFragmentBoundingBoxFactory();
    const lineRule = new PdfTextFragmentLineRule(boundingBoxFactory);
    const clusterer = new PdfTextFragmentClusterer(lineRule, boundingBoxFactory);

    const clusters = clusterer.cluster(page1);

    const exportPayload = clusters.map((cluster, index) =>
      Object.freeze({
        clusterIndex: index + 1,
        pageNumber: 1,
        text: normalizeText(cluster.map((x) => x.text).join(" ")),
        fragments: cluster.map((x) =>
          Object.freeze({
            pageNumber: x.pageNumber,
            text: x.text,
            x: x.x,
            y: x.y,
            width: x.width,
            height: x.height,
          }),
        ),
      }),
    );

    await writeFile(
      outputPath,
      JSON.stringify(exportPayload, null, 2),
      { encoding: "utf-8" },
    );

    const normalizedClusters = exportPayload.map((x) => x.text.toLowerCase());

    const svinClusterIndex = normalizedClusters.findIndex((x) =>
      x.includes("svin ytrefilet"),
    );

    const pizzaClusterIndex = normalizedClusters.findIndex((x) =>
      x.includes("pizza grandiosa"),
    );

    expect(svinClusterIndex).toBeGreaterThan(-1);
    expect(pizzaClusterIndex).toBeGreaterThan(-1);
    expect(svinClusterIndex).not.toBe(pizzaClusterIndex);

    expect(
      normalizedClusters.some(
        (x) => x.includes("svin ytrefilet") && x.includes("pizza grandiosa"),
      ),
    ).toBe(false);
  });
});