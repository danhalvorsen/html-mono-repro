
import { describe, expect, it } from "vitest";
import {
  InverseNormalApproximation,
  NormalDistribution,
} from "../src/index.js";

describe("InverseNormalApproximation", () => {
  it("should return approximately zero at p=0.5", () => {
    expect(InverseNormalApproximation.inverseCdf(0.5)).toBeCloseTo(0, 10);
  });

  it("should invert the standard normal cdf", () => {
    const normal = new NormalDistribution(0, 1);
    const probabilities = [0.025, 0.1, 0.5, 0.9, 0.975];

    for (const probability of probabilities) {
      const z = InverseNormalApproximation.inverseCdf(probability);
      expect(normal.cdf(z)).toBeCloseTo(probability, 4);
    }
  });

  it("should reject boundary probabilities", () => {
    expect(() => InverseNormalApproximation.inverseCdf(0)).toThrowError(RangeError);
  });
});
 