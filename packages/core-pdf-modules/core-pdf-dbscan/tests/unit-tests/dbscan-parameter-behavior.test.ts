// packages/core-pdf-dbscan/tests/unit-tests/dbscan-parameter-behavior.test.ts

import { describe, expect, it } from "vitest";
import { DbscanPdfFragmentClusterer } from "../../src/code.js";
import { Fixture } from "./Fixture.js";

describe("DbscanPdfFragmentClusterer parameter behavior", () => {
  const fx = new Fixture();

  it("should produce 2 clusters and 0 noise when eps=0.01 and minPts=1", () => {
    const sut = new DbscanPdfFragmentClusterer();
    const input = fx.clusterWithSingleIsolatedNoiseCandidate();

    const result = sut.cluster(input, 0.01, 1);

    expect(result.clusters.length).toBe(2);
    expect(result.clusters[0].items.length).toBe(3);
    expect(result.clusters[1].items.length).toBe(1);
    expect(result.noise.length).toBe(0);
  });

  it("should produce 1 cluster and 1 noise when eps=0.01 and minPts=2", () => {
    const sut = new DbscanPdfFragmentClusterer();
    const input = fx.clusterWithSingleIsolatedNoiseCandidate();

    const result = sut.cluster(input, 0.01, 2);

    expect(result.clusters.length).toBe(1);
    expect(result.clusters[0].items.length).toBe(3);
    expect(result.noise.length).toBe(1);
  });
});