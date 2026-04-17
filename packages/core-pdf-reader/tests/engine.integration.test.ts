// tests/engine.integration.test.ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CompositePdfEngine } from "../src/old/engine/CompositePdfEngine.js";

describe("CompositePdfEngine", () => {
  it("should read a real pdf", async () => {
    const filePath = join(process.cwd(), "tests", "Kiwi.pdf");
    const binary = new Uint8Array(await readFile(filePath));

    const engine = new CompositePdfEngine();
    const pages = await engine.readPages(binary);

    expect(pages.length).toBeGreaterThan(0);
    expect(pages.some((page) => page.text.length > 0)).toBe(true);
  });
});

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").replace(/\s+,/g, ",").trim().toLowerCase();
}

describe("CompositePdfEngine (Kiwi.pdf) - Pizza Grandiosa assertion", () => {
  it("should contain Pizza Grandiosa with details", async () => {
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
    const text = fullText
    expect(text).toContain(normalizeText("pizza grandiosa"));
    expect(text).toContain(normalizeText("575 g"));
    expect(text).toContain(normalizeText("original"));
    expect(text).toContain(normalizeText("fryst"));
    expect(text).toContain(normalizeText("stabburet"));
  });
});
