
// =====================================================================================
// FILE: tests/distributions/NormalDistribution.spec.ts
// =====================================================================================

import { describe, expect, it } from "vitest";
import { NormalDistribution, Mulberry32RandomSource } from "../src/index.js";

describe("NormalDistribution", () => {
  it("should compute pdf at the mean", () => {
    const sut = new NormalDistribution(0, 1);

    expect(sut.pdf(0)).toBeCloseTo(0.3989422804, 8);
  });

  it("should compute cdf at the mean", () => {
    const sut = new NormalDistribution(10, 2);

    expect(sut.cdf(10)).toBeCloseTo(0.5, 6);
  });

  it("should invert cdf consistently", () => {
    const sut = new NormalDistribution(0, 1);
    const p = 0.975;

    expect(sut.cdf(sut.inverseCdf(p))).toBeCloseTo(p, 4);
  });

  it("should sample finite values", () => {
    const sut = new NormalDistribution(5, 2);
    const random = new Mulberry32RandomSource(123);

    const values = Array.from({ length: 1000 }, () => sut.sample(random));

    for (const value of values) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("should reject non-positive standard deviation", () => {
    expect(() => new NormalDistribution(0, 0)).toThrowError(RangeError);
  });
});
