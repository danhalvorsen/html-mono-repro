import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { CompositePdfEngine } from "../../src/engine/CompositePdfEngine.js";
import type { IPdfTextFragment } from "../../src/IPdfTextFragment.js";

const thisDirectory = dirname(fileURLToPath(import.meta.url));
const pidPdfPath = join(thisDirectory, "PID.pdf");
const outputJsonPath = join(thisDirectory, "PID.fragments.json");

describe("CompositePdfEngine (PID.pdf) integration", () => {
  it("reads PID.pdf and writes extracted fragments JSON in the same folder", async () => {
    expect(existsSync(pidPdfPath)).toBe(true);

    const binary = new Uint8Array(readFileSync(pidPdfPath));
    const engine = new CompositePdfEngine();

    const fragments = await engine.readTextFragments(binary) as readonly IPdfTextFragment[];

    const sorted = [...fragments].sort((left, right) => {
      if (left.pageNumber !== right.pageNumber) {
        return left.pageNumber - right.pageNumber;
      }

      const deltaY = right.y - left.y;
      if (Math.abs(deltaY) > 2) {
        return deltaY;
      }

      return left.x - right.x;
    });

    const payload = {
      sourcePdf: "PID.pdf",
      generatedAt: new Date().toISOString(),
      totals: {
        fragments: sorted.length,
      },
      fragments: sorted,
    };

    writeFileSync(outputJsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");

    expect(sorted.length).toBeGreaterThan(0);
    expect(
      sorted.some((fragment) =>
        typeof fragment.fontSize === "number" && fragment.fontSize > 0,
      ),
    ).toBe(true);
    expect(existsSync(outputJsonPath)).toBe(true);
  });
});
