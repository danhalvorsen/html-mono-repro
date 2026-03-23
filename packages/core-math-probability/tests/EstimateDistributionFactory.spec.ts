import { DistributionKind, EstimateDistributionFactory, EstimateRange, EstimateShape, OneSampleZTest, PertEstimateDistributionPolicy, Probability, SkewNormalEstimateDistributionPolicy, TailKind, TriangularEstimateDistributionPolicy } from "../src/index.js";
import { describe, expect, it } from "vitest";

describe("EstimateDistributionFactory", () => {
  it("should delegate to the matching policy", () => {
    const sut = new EstimateDistributionFactory([
      new TriangularEstimateDistributionPolicy(),
      new PertEstimateDistributionPolicy(),
      new SkewNormalEstimateDistributionPolicy(),
    ]);

    const distribution = sut.create({
      kind: DistributionKind.Pert,
      range: new EstimateRange(10, 20, 40),
      shape: new EstimateShape(0.7, 0.1, 1),
    });

    expect(distribution.kind).toBe(DistributionKind.Pert);
  });

  it("should throw when no policy supports the distribution kind", () => {
    const sut = new EstimateDistributionFactory([]);

    expect(() =>
      sut.create({
        kind: DistributionKind.Pert,
        range: new EstimateRange(10, 20, 40),
        shape: new EstimateShape(0.7, 0.1, 1),
      }),
    ).toThrowError();
  });
});

// =====================================================================================
// FILE: tests/services/PercentileService.spec.ts
// =====================================================================================
