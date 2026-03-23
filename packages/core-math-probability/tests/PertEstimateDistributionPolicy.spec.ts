
// =====================================================================================
// FILE: tests/policies/PertEstimateDistributionPolicy.spec.ts
// =====================================================================================

import { describe, expect, it } from "vitest";
import {
  DistributionKind,
  PertEstimateDistributionPolicy,
  EstimateRange,
  EstimateShape,
} from "../src/index.js";

describe("PertEstimateDistributionPolicy", () => {
  it("should support pert kind", () => {
    const sut = new PertEstimateDistributionPolicy();

    expect(sut.supports(DistributionKind.Pert)).toBe(true);
  });

  it("should create a pert distribution", () => {
    const sut = new PertEstimateDistributionPolicy();

    const distribution = sut.create({
      kind: DistributionKind.Pert,
      range: new EstimateRange(10, 20, 40),
      shape: new EstimateShape(0.7, 0.1, 1),
    });

    expect(distribution.kind).toBe(DistributionKind.Pert);
  });
});

