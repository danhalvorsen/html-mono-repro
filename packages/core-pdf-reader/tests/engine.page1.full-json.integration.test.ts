// packages/core-pdf-reader/tests/engine.page1.full-json.integration.test.ts

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CompositePdfEngine } from "../src/old/engine/CompositePdfEngine.js";
import type { IPdfTextFragment } from "../src/old/IPdfTextFragment.js";

describe("CompositePdfEngine (Kiwi.pdf) - page 1 full JSON export", () => {
  it("should export ALL page 1 fragments as raw JSON (no filtering)", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const outputPath = join(process.cwd(), "tests", "Kiwi.page1.full.json");

    const binary = new Uint8Array(await readFile(inputPath));

    const engine = new CompositePdfEngine();

    const fragments =
      (await (engine as any).readTextFragments(binary)) as readonly IPdfTextFragment[];

    // 🔴 IMPORTANT: use real objects (no remapping)
    const page1 = fragments.filter((f) => f.pageNumber === 1);

    // deterministic ordering (important for diff/debug)
    const sorted = [...page1].sort((a, b) => {
      const ay = a.boundingBox.position.y;
      const by = b.boundingBox.position.y;
      if (by !== ay) return by - ay; // top → bottom
      return a.boundingBox.position.x - b.boundingBox.position.x; // left → right
    });

    await writeFile(
      outputPath,
      JSON.stringify(sorted, null, 2),
      { encoding: "utf-8" },
    );

    // sanity checks
    expect(sorted.length).toBeGreaterThan(0);

    const hasTitle = sorted.some((f) =>
      f.text.toLowerCase().includes("svin ytrefilet"),
    );

    const hasPizza = sorted.some((f) =>
      f.text.toLowerCase().includes("pizza grandiosa"),
    );

    expect(hasTitle).toBe(true);
    expect(hasPizza).toBe(true);
  });
});