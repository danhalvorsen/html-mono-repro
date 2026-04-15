// tests/engine.page1.json.integration.test.ts

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CompositePdfEngine } from "../src/engine/CompositePdfEngine.js";
import type { IPdfTextFragment } from "../src/IPdfTextFragment.js";

function normalizeText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim()
    .toLowerCase();
}

describe("CompositePdfEngine (Kiwi.pdf) - page 1 JSON dump", () => {
  it("should extract page 1 fragments using domain model", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const outputPath = join(process.cwd(), "tests", "Kiwi.page1.fragments.json");

    const binary = new Uint8Array(await readFile(inputPath));
    const engine = new CompositePdfEngine();

    const fragments =
      (await (engine as any).readTextFragments(binary)) as readonly IPdfTextFragment[];

    const page1 = fragments.filter((f) => f.pageNumber === 1);

    // write EXACT domain object (no projection)
    await writeFile(outputPath, JSON.stringify(page1, null, 2), "utf-8");

    expect(page1.length).toBeGreaterThan(0);

    const normalized = page1.map((f) => normalizeText(f.text));

    const hasTitle = normalized.some((t) => t.includes("svin ytrefilet"));
    const hasSubtitle = normalized.some((t) => t.includes("ca. 900 g, skivet"));
    const hasBrandLine = normalized.some((t) => t.includes("folkets, pr. kg"));

    expect(hasTitle).toBe(true);
    expect(hasSubtitle).toBe(true);
    expect(hasBrandLine).toBe(true);
  });
});