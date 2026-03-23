// =====================================================================================
// FILE: tests/policies/SkewNormalEstimateDistributionPolicy.spec.ts
// =====================================================================================

import { describe, expect, it } from "vitest";
import {
  DistributionKind,
  SkewNormalEstimateDistributionPolicy,
  EstimateRange,
  EstimateShape,
} from "../src/index.js";

describe("SkewNormalEstimateDistributionPolicy", () => {
  it("should support skew normal kind", () => {
    const sut = new SkewNormalEstimateDistributionPolicy();

    expect(sut.supports(DistributionKind.SkewNormal)).toBe(true);
  });

  it("should create a skew normal estimate distribution", () => {
    const sut = new SkewNormalEstimateDistributionPolicy();

    const distribution = sut.create({
      kind: DistributionKind.SkewNormal,
      range: new EstimateRange(10, 20, 40),
      shape: new EstimateShape(0.7, 0.1, 1),
    });

    expect(distribution.kind).toBe(DistributionKind.SkewNormal);
  });
});
