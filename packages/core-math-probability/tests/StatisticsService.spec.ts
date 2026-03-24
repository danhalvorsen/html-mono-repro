import { EstimateReportBuilder, OneSampleZTest, PercentileService, Probability, Sample, StatisticsService, TailKind, TriangularDistribution } from "../src/index.js";
import { describe, expect, it } from "vitest";
 
describe("StatisticsService", () => {
  const sut = new StatisticsService();
  const sample = new Sample([2, 4, 4, 4, 5, 5, 7, 9]);

  it("should compute mean", () => {
    expect(sut.mean(sample)).toBe(5);
  });

  it("should compute population variance", () => {
    expect(sut.variancePopulation(sample)).toBe(4);
  });

  it("should compute sample variance", () => {
    expect(sut.varianceSample(sample)).toBeCloseTo(4.5714285714, 10);
  });

  it("should compute population standard deviation", () => {
    expect(sut.standardDeviationPopulation(sample)).toBe(2);
  });

  it("should compute sample standard deviation", () => {
    expect(sut.standardDeviationSample(sample)).toBeCloseTo(2.138089935, 9);
  });

  it("should compute minimum and maximum", () => {
    expect(sut.minimum(sample)).toBe(2);
    expect(sut.maximum(sample)).toBe(9);
  });

  it("should reject sample variance for sample size < 2", () => {
    expect(() => sut.varianceSample(new Sample([1]))).toThrowError(RangeError);
  });
});
