
// =====================================================================================
// FILE: tests/services/MonteCarloSimulator.spec.ts
// =====================================================================================
import { EstimateReportBuilder, MonteCarloSimulator, Mulberry32RandomSource, OneSampleZTest, PercentileService, Probability, Sample, StatisticsService, TailKind, TriangularDistribution } from "../src/index.js";
import { describe, expect, it } from "vitest";
 
describe("MonteCarloSimulator", () => {
  it("should generate the configured number of samples", () => {
    const sut = new MonteCarloSimulator();
    const distribution = new TriangularDistribution(10, 20, 40);
    const sample = sut.simulate(distribution, new Mulberry32RandomSource(42), 500);

    expect(sample.values).toHaveLength(500);
  });

  it("should reject non-positive iteration count", () => {
    const sut = new MonteCarloSimulator();
    const distribution = new TriangularDistribution(10, 20, 40);

    expect(() =>
      sut.simulate(distribution, new Mulberry32RandomSource(42), 0),
    ).toThrowError(RangeError);
  });
});
