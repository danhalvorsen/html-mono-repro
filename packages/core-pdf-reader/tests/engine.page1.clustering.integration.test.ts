// packages/core-pdf-reader/tests/engine.page1.clustering.integration.test.ts

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CompositePdfEngine } from "../src/engine/CompositePdfEngine.js";
import type { IPdfTextFragment } from "../src/IPdfTextFragment.js";

describe("CompositePdfEngine (Kiwi.pdf) - page 1 clustering", () => {
  it("should group page 1 fragments into stable line clusters", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const binary = new Uint8Array(await readFile(inputPath));

    const engine = new CompositePdfEngine();

    const fragments =
      (await (engine as any).readTextFragments(binary)) as readonly IPdfTextFragment[];

    const page1 = fragments.filter((f) => f.pageNumber === 1);

    expect(page1.length).toBeGreaterThan(0);

    const lines =
      (engine as any).groupIntoLines(page1) as readonly string[];

    expect(lines.length).toBeGreaterThan(5);
    expect(lines.length).toBeLessThan(100);

    const normalizedLines = lines.map((x) =>
      x.replace(/\s+/g, " ").replace(/\s+,/g, ",").trim().toLowerCase(),
    );

    expect(
      normalizedLines.some((x) => x.includes("svin ytrefilet")),
    ).toBe(true);

    expect(
      normalizedLines.some((x) => x.includes("ca. 900 g, skivet")),
    ).toBe(true);

    expect(
      normalizedLines.some((x) => x.includes("pizza grandiosa")),
    ).toBe(true);

    expect(
      normalizedLines.some((x) => x.includes("575 g, original, fryst, stabburet")),
    ).toBe(true);

    expect(
      normalizedLines.some((x) => x.includes("folkets, pr. kg")),
    ).toBe(true);
  });

  it("should report deterministic clustering statistics for page 1 only", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const binary = new Uint8Array(await readFile(inputPath));

    const engine = new CompositePdfEngine();

    const fragments =
      (await (engine as any).readTextFragments(binary)) as readonly IPdfTextFragment[];

    const page1 = fragments.filter((f) => f.pageNumber === 1);

    const lines =
      (engine as any).groupIntoLines(page1) as readonly string[];

    const stats = Object.freeze({
      pageNumber: 1,
      fragmentCount: page1.length,
      clusterCount: lines.length,
      avgFragmentsPerCluster: page1.length / lines.length,
    });

    expect(stats.fragmentCount).toBeGreaterThan(20);
    expect(stats.clusterCount).toBeGreaterThan(5);
    expect(stats.clusterCount).toBeLessThan(stats.fragmentCount);
    expect(stats.avgFragmentsPerCluster).toBeGreaterThan(1);

    console.log("Page 1 clustering stats:", stats);
  });
});