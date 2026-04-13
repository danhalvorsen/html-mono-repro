// packages/core-pdf-reader/tests/engine.clustering.integration.test.ts

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CompositePdfEngine } from "../src/engine/CompositePdfEngine.js";

describe("CompositePdfEngine (Kiwi.pdf) - clustering", () => {
  it("Given Kiwi PDF When grouping into lines Then cluster count is within expected bounds", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const binary = new Uint8Array(await readFile(inputPath));

    const engine = new CompositePdfEngine();

    // FIXED HERE
    const fragments = await (engine as any).readTextFragments(binary);

    const byPage = new Map<number, typeof fragments>();

    for (const f of fragments) {
      const list = byPage.get(f.pageNumber);
      if (!list) byPage.set(f.pageNumber, [f]);
      else list.push(f);
    }

    let totalClusters = 0;

    for (const [, pageFragments] of byPage) {
      const lines = (engine as any).groupIntoLines(pageFragments);
      totalClusters += lines.length;
    }

    expect(totalClusters).toBeGreaterThan(200);
    expect(totalClusters).toBeLessThan(2000);
  });

  it("Given Kiwi PDF When computing clustering statistics Then metrics are consistent", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const binary = new Uint8Array(await readFile(inputPath));

    const engine = new CompositePdfEngine();

    const fragments = await (engine as any).readTextFragments(binary);

    // ─────────────────────────────────────────────────────────────
    // Aggregate
    // ─────────────────────────────────────────────────────────────
    const byPage = new Map<number, typeof fragments>();

    for (const f of fragments) {
      const list = byPage.get(f.pageNumber);
      if (!list) byPage.set(f.pageNumber, [f]);
      else list.push(f);
    }

    let totalClusters = 0;
    let totalFragments = fragments.length;

    let minClustersPerPage = Number.MAX_SAFE_INTEGER;
    let maxClustersPerPage = 0;

    for (const [, pageFragments] of byPage) {
      const lines = (engine as any).groupIntoLines(pageFragments);

      const clusterCount = lines.length;

      totalClusters += clusterCount;

      if (clusterCount < minClustersPerPage) minClustersPerPage = clusterCount;
      if (clusterCount > maxClustersPerPage) maxClustersPerPage = clusterCount;
    }

    const stats = Object.freeze({
      pageCount: byPage.size,
      totalFragments,
      totalClusters,
      avgClustersPerPage: totalClusters / byPage.size,
      minClustersPerPage,
      maxClustersPerPage,
    });

    // ─────────────────────────────────────────────────────────────
    // Assertions (stable invariants)
    // ─────────────────────────────────────────────────────────────
    expect(stats.pageCount).toBeGreaterThan(0);

    expect(stats.totalFragments).toBeGreaterThan(0);
    expect(stats.totalClusters).toBeGreaterThan(0);

    // clustering must reduce or equal fragments
    expect(stats.totalClusters).toBeLessThanOrEqual(stats.totalFragments);

    // sanity bounds (non brittle)
    expect(stats.avgClustersPerPage).toBeGreaterThan(5);
    expect(stats.maxClustersPerPage).toBeGreaterThanOrEqual(
      stats.minClustersPerPage,
    );

    // optional debug output (kept deterministic)
    console.log("PDF clustering stats:", stats);
  });
});
