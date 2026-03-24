
// =====================================================================================
// FILE: tests/policies/TriangularEstimateDistributionPolicy.spec.ts
// =====================================================================================

import { describe, expect, it } from "vitest";
import {
  DistributionKind,
  PertEstimateDistributionPolicy,
  EstimateRange,
  EstimateShape,
  TriangularEstimateDistributionPolicy,
} from "../src/index.js";

describe("TriangularEstimateDistributionPolicy", () => {
  it("should support triangular kind", () => {
    const sut = new TriangularEstimateDistributionPolicy();

    expect(sut.supports(DistributionKind.Triangular)).toBe(true);
  });

  it("should create a triangular distribution", () => {
    const sut = new TriangularEstimateDistributionPolicy();

    const distribution = sut.create({
      kind: DistributionKind.Triangular,
      range: new EstimateRange(10, 20, 40),
      shape: new EstimateShape(0.7, 0.1, 1),
    });

    expect(distribution.kind).toBe(DistributionKind.Triangular);
  });
});
