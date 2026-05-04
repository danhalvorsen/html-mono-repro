// packages/core-pdf-dbscan/tests/DbscanPdfFragmentClusterer.test.ts

import { describe, expect, it } from "vitest";
import { DbscanPdfFragmentClusterer } from "../../src/code.js";
import { Point } from "core-math/dist/index.js";

/* =================================================================================================
   Fixture (ONLY test data — no domain redefinitions)
   ================================================================================================= */

export class Fixture {
  public createFragment(x: number, y: number) {
    return {
      kind: "rectangle" as const,
      pageNumber: 1,
      boundingBox: {
        position: { x, y },
        width: 1,
        height: 1,
      },
    };
  }
  
public cross(): ReadonlyArray<ReturnType<Fixture["createFragment"]>> {
    return Object.freeze([
      
      this.createFragment(-2, 0),
      this.createFragment(0, 2),
      this.createFragment(0,-2),
      this.createFragment(2,0 ),
    ]);
}

public fourSeparated() {
    return Object.freeze([
      this.createFragment(1, 2),
      this.createFragment(3, 2),
      this.createFragment(1, -1),
      this.createFragment(3, -1),
    ]);
  }

  public singleCluster() {
    return Object.freeze([
      this.createFragment(0, 0),
      this.createFragment(1, 0),
      this.createFragment(0, 1),
      this.createFragment(1, 1),
    ]);
  }

  public twoClusters() {
    return Object.freeze([
      this.createFragment(0, 0),
      this.createFragment(1, 0),
      this.createFragment(0, 1),

      this.createFragment(10, 10),
      this.createFragment(11, 10),
      this.createFragment(10, 11),
    ]);
  }

  public withNoise() {
    return Object.freeze([
      this.createFragment(0, 0),
      this.createFragment(1, 0),
      this.createFragment(0, 1),

      this.createFragment(20, 20),
    ]);
  }

  public samePositionDifferentPages() {
    return Object.freeze([
      this.createFragment(5, 5),
      {
        ...this.createFragment(5, 5),
        pageNumber: 2 as const,
      },
    ]);
  }
}

/* =================================================================================================
   Tests
   ================================================================================================= */

describe("DbscanPdfFragmentClusterer", () => {
  const fx = new Fixture();

  it("should throw for invalid eps", () => {
    const sut = new DbscanPdfFragmentClusterer();

    expect(() => sut.cluster(fx.singleCluster(), -1, 2)).toThrow();
    expect(() => sut.cluster(fx.singleCluster(), Number.NaN, 2)).toThrow();
  });

  it("should throw for invalid minPts", () => {
    const sut = new DbscanPdfFragmentClusterer();

    expect(() => sut.cluster(fx.singleCluster(), 1, 0)).toThrow();
  });

  it("should return empty result for empty input", () => {
    const sut = new DbscanPdfFragmentClusterer();

    const result = sut.cluster([], 1, 2);

    expect(result.clusters.length).toBe(0);
    expect(result.noise.length).toBe(0);
  });

  it("should classify separated fragments as noise", () => {
    const sut = new DbscanPdfFragmentClusterer();

    const result = sut.cluster(fx.fourSeparated(), 0.01, 2);

    expect(result.clusters.length).toBe(0);
    expect(result.noise.length).toBe(4);
  });

  it("should create a single cluster when dense", () => {
    const sut = new DbscanPdfFragmentClusterer();

    const result = sut.cluster(fx.singleCluster(), 0.01, 1);

    expect(result.clusters.length).toBe(1);
    expect(result.clusters[0].items.length).toBe(4);
    expect(result.noise.length).toBe(0);
  });

  it("should create two clusters when separated groups", () => {
    const sut = new DbscanPdfFragmentClusterer();

    const result = sut.cluster(fx.twoClusters(), 0.01, 1);

    expect(result.clusters.length).toBe(2);
    expect(result.clusters[0].items.length).toBe(3);
    expect(result.clusters[1].items.length).toBe(3);
  });

  it("should keep isolated fragment as noise", () => {
    const sut = new DbscanPdfFragmentClusterer();

    const result = sut.cluster(fx.withNoise(), 0.01, 2);

    expect(result.clusters.length).toBe(1);
    expect(result.clusters[0].items.length).toBe(3);
    expect(result.noise.length).toBe(1);
  });

  it("should be deterministic", () => {
    const sut = new DbscanPdfFragmentClusterer();
    const input = fx.twoClusters();

    const a = sut.cluster(input, 0.01, 1);
    const b = sut.cluster(input, 0.01, 1);

    expect(a.clusters.map(c => c.items.length)).toEqual(
      b.clusters.map(c => c.items.length),
    );

    expect(a.noise.length).toBe(b.noise.length);
  });

  it("should never cluster across page boundaries", () => {
    const sut = new DbscanPdfFragmentClusterer();

    const result = sut.cluster(fx.samePositionDifferentPages(), 100, 2);

    expect(result.clusters.length).toBe(0);
    expect(result.noise.length).toBe(2);
  });
});
