// packages/core-pdf-reader/tests/engine.page1.clusters.integration.test.ts

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CompositePdfEngine } from "../src/engine/CompositePdfEngine.js";
import type { IPdfTextFragment } from "../src/IPdfTextFragment.js";

function normalizeText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

describe("CompositePdfEngine (Kiwi.pdf) - page 1 clusters", () => {
  it("should write grouped page 1 clusters as JSON", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const outputPath = join(process.cwd(), "tests", "Kiwi.page1.clusters.json");

    const binary = new Uint8Array(await readFile(inputPath));
    const engine = new CompositePdfEngine();

    const fragments =
      (await (engine as any).readTextFragments(binary)) as readonly IPdfTextFragment[];

    const page1 = fragments.filter((f) => f.pageNumber === 1);
    expect(page1.length).toBeGreaterThan(0);

    const lines =
      (engine as any).groupIntoLines(page1) as readonly string[];

    const clusters = lines.map((line, index) =>
      Object.freeze({
        clusterIndex: index + 1,
        pageNumber: 1,
        text: normalizeText(line),
      }),
    );

    await writeFile(
      outputPath,
      JSON.stringify(clusters, null, 2),
      { encoding: "utf-8" },
    );

    expect(clusters.length).toBeGreaterThan(5);

    const normalized = clusters.map((x) => x.text.toLowerCase());

    expect(normalized.some((x) => x.includes("svin ytrefilet"))).toBe(true);
    expect(normalized.some((x) => x.includes("pizza grandiosa"))).toBe(true);
    expect(normalized.some((x) => x.includes("ca. 900 g, skivet"))).toBe(true);
    expect(normalized.some((x) => x.includes("575 g, original, fryst, stabburet"))).toBe(true);
    expect(normalized.some((x) => x.includes("folkets, pr. kg"))).toBe(true);
  });
});