
import { EstimateRange, EstimateShape, Mulberry32RandomSource, SkewNormalEstimateDistribution } from "../src/index.js";
import { describe, expect, it } from "vitest";

describe("SkewNormalEstimateDistribution", () => {
  it("should return a non-negative pdf", () => {
    const sut = new SkewNormalEstimateDistribution(
      new EstimateRange(10, 20, 40),
      new EstimateShape(0.6, 0.35, 1.0),
    );

    expect(sut.pdf(20)).toBeGreaterThanOrEqual(0);
  });

  it("should return cdf in [0,1]", () => {
    const sut = new SkewNormalEstimateDistribution(
      new EstimateRange(10, 20, 40),
      new EstimateShape(0.6, 0.35, 1.0),
    );

    const value = sut.cdf(20);

    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });

  it("should approximately invert cdf", () => {
    const sut = new SkewNormalEstimateDistribution(
      new EstimateRange(10, 20, 40),
      new EstimateShape(0.6, 0.35, 1.0),
    );

    const p = 0.75;

    expect(sut.cdf(sut.inverseCdf(p))).toBeCloseTo(p, 2);
  });

  it("should sample finite values", () => {
    const sut = new SkewNormalEstimateDistribution(
      new EstimateRange(10, 20, 40),
      new EstimateShape(0.6, 0.35, 1.0),
    );
    const random = new Mulberry32RandomSource(42);

    const values = Array.from({ length: 1000 }, () => sut.sample(random));

    for (const value of values) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });
});
 