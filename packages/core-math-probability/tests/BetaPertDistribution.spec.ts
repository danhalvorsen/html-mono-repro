// =====================================================================================
// FILE: tests/distributions/BetaPertDistribution.spec.ts
// =====================================================================================

import { describe, expect, it } from "vitest";
import { BetaPertDistribution, Mulberry32RandomSource } from "../src/index.js";

describe("BetaPertDistribution", () => {
  it("should invert cdf consistently", () => {
    const sut = new BetaPertDistribution(10, 20, 40, 4);
    const p = 0.9;

    expect(sut.cdf(sut.inverseCdf(p))).toBeCloseTo(p, 4);
  });

  it("should sample only within bounds", () => {
    const sut = new BetaPertDistribution(10, 20, 40, 4);
    const random = new Mulberry32RandomSource(7);

    for (let index = 0; index < 1000; index += 1) {
      const value = sut.sample(random);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(40);
    }
  });

  it("should reject invalid ordering", () => {
    expect(() => new BetaPertDistribution(20, 10, 40, 4)).toThrowError(RangeError);
  });

  it("should reject non-positive lambda", () => {
    expect(() => new BetaPertDistribution(10, 20, 40, 0)).toThrowError(RangeError);
  });
});
