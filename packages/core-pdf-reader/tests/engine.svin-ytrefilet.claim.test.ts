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

  it("should preserve both title and subtitle as separate line clusters in a minimal synthetic case", async () => {
    const engine = new CompositePdfEngine();

    const fragments = Object.freeze([
      // Title line
      Object.freeze({
        pageNumber: 1,
        text: "SVIN",
        x: 40,
        y: 220,
        width: 90,
        height: 42,
      }),
      Object.freeze({
        pageNumber: 1,
        text: "YTREFILET",
        x: 145,
        y: 220,
        width: 210,
        height: 42,
      }),

      // Subtitle line 1
      Object.freeze({
        pageNumber: 1,
        text: "Ca.",
        x: 120,
        y: 158,
        width: 34,
        height: 20,
      }),
      Object.freeze({
        pageNumber: 1,
        text: "900",
        x: 170,
        y: 158,
        width: 42,
        height: 20,
      }),
      Object.freeze({
        pageNumber: 1,
        text: "g,",
        x: 222,
        y: 158,
        width: 18,
        height: 20,
      }),
      Object.freeze({
        pageNumber: 1,
        text: "skivet,",
        x: 252,
        y: 158,
        width: 92,
        height: 20,
      }),

      // Subtitle line 2
      Object.freeze({
        pageNumber: 1,
        text: "Folkets,",
        x: 132,
        y: 128,
        width: 88,
        height: 20,
      }),
      Object.freeze({
        pageNumber: 1,
        text: "pr.",
        x: 230,
        y: 128,
        width: 24,
        height: 20,
      }),
      Object.freeze({
        pageNumber: 1,
        text: "kg",
        x: 262,
        y: 128,
        width: 24,
        height: 20,
      }),
    ]);

    const lines = (engine as any).groupIntoLines(fragments) as readonly string[];
    const normalizedLines = lines.map(normalizeText);

    expect(normalizedLines).toContain(normalizeText("SVIN YTREFILET"));
    expect(normalizedLines).toContain(normalizeText("Ca. 900 g, skivet,"));
    expect(normalizedLines).toContain(normalizeText("Folkets, pr. kg"));
  });
});