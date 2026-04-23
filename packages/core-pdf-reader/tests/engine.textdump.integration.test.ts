// tests/engine.textdump.integration.test.ts

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CompositePdfEngine } from "../src/engine/CompositePdfEngine.js";

describe("CompositePdfEngine text dump (Kiwi.pdf)", () => {
  it("should extract and dump full text content", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const outputPath = join(process.cwd(), "tests", "Kiwi.txt");

    const binary = new Uint8Array(await readFile(inputPath));

    const engine = new CompositePdfEngine();
    const pages = await engine.readPages(binary);

    const fullText = [...pages]
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`)
      .join("\n\n");

    await writeFile(outputPath, fullText, { encoding: "utf-8" });

    expect(fullText.length).toBeGreaterThan(0);
    expect(pages.length).toBeGreaterThan(0);
  });
});

