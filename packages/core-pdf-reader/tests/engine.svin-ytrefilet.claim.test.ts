// packages/core-pdf-reader/tests/engine.svin-ytrefilet.claim.test.ts

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CompositePdfEngine } from "../src/engine/CompositePdfEngine.js";

function normalizeText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim()
    .toLowerCase();
}

describe("CompositePdfEngine - SVIN YTREFILET claim", () => {
  it("should prove or disprove the claim against the real Kiwi.pdf", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const binary = new Uint8Array(await readFile(inputPath));

    const engine = new CompositePdfEngine();
    const pages = await engine.readPages(binary);

    const fullText = normalizeText(
      [...pages]
        .sort((a, b) => a.pageNumber - b.pageNumber)
        .map((page) => page.text)
        .join("\n"),
    );

    const hasTitle = fullText.includes(normalizeText("SVIN YTREFILET"));
    const hasSubtitle = fullText.includes(normalizeText("Ca. 900 g, skivet"));
    const hasBrandLine = fullText.includes(normalizeText("Folkets, pr. kg"));

    // This test explicitly disproves the claim if title is present.
    expect(hasTitle).toBe(true);
    expect(hasSubtitle).toBe(true);
    expect(hasBrandLine).toBe(true);
  });
});