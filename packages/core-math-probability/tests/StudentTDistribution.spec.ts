import { EstimateReportBuilder, OneSampleZTest, PercentileService, Probability, Sample, StatisticsService, StudentTDistribution, TailKind, TriangularDistribution } from "../src/index.js";
import { describe, expect, it } from "vitest";

describe("StudentTDistribution", () => {
  it("should return symmetric cdf around zero", () => {
    const sut = new StudentTDistribution(10);

    expect(sut.cdf(0)).toBeCloseTo(0.5, 6);
    expect(sut.cdf(1)).toBeCloseTo(1 - sut.cdf(-1), 6);
  });

  it("should return positive pdf values", () => {
    const sut = new StudentTDistribution(10);

    expect(sut.pdf(0)).toBeGreaterThan(0);
    expect(sut.pdf(1)).toBeGreaterThan(0);
  });

  it("should reject non-positive degrees of freedom", () => {
    expect(() => new StudentTDistribution(0)).toThrowError(RangeError);
  });
});
