import { EstimateReportBuilder, OneSampleZTest, PercentileService, Probability, Sample, StatisticsService, TailKind, TriangularDistribution } from "../src/index.js";
import { describe, expect, it } from "vitest";

describe("EstimateReportBuilder", () => {
  it("should create a report for any supported distribution", () => {
    const sut = new EstimateReportBuilder(
      new StatisticsService(),
      new PercentileService(),
    );

    const distribution = new TriangularDistribution(10, 20, 40);
    const sample = new Sample([10, 15, 20, 25, 30, 35, 40]);

    const report = sut.build(distribution, sample);

    expect(report.distribution.kind).toBe(distribution.kind);
    expect(report.statistics.mean).toBeGreaterThan(0);
    expect(report.statistics.percentile95).toBeGreaterThanOrEqual(report.statistics.percentile90);
    expect(report.statistics.percentile90).toBeGreaterThanOrEqual(report.statistics.percentile80);
    expect(report.statistics.percentile80).toBeGreaterThanOrEqual(report.statistics.percentile50);
  });
});
