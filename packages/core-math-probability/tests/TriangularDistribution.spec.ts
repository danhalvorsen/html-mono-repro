
import { TriangularDistribution, Mulberry32RandomSource } from "../src/index.js";
import { describe, expect, it } from "vitest";
describe("TriangularDistribution", () => {
  it("should return zero cdf below minimum", () => {
    const sut = new TriangularDistribution(10, 20, 40);

    expect(sut.cdf(9)).toBe(0);
  });

  it("should return one cdf above maximum", () => {
    const sut = new TriangularDistribution(10, 20, 40);

    expect(sut.cdf(41)).toBe(1);
  });

  it("should invert cdf consistently", () => {
    const sut = new TriangularDistribution(10, 20, 40);

    expect(sut.cdf(sut.inverseCdf(0.8))).toBeCloseTo(0.8, 8);
  });

  it("should sample only within bounds", () => {
    const sut = new TriangularDistribution(10, 20, 40);
    const random = new Mulberry32RandomSource(42);

    for (let index = 0; index < 1000; index += 1) {
      const value = sut.sample(random);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(40);
    }
  });

  it("should reject invalid parameter ordering", () => {
    expect(() => new TriangularDistribution(20, 10, 40)).toThrowError(RangeError);
  });
});