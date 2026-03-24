import { EstimateReportBuilder, IContinuousProbabilityDistribution, OneSampleZTest, PercentileService, Probability, Sample, StatisticsService, TailKind, TriangularDistribution } from "../src/index.js";
import { describe, expect, it } from "vitest";
import { ProbabilityFixture } from "./ProbabilityFixture.js";

function runContinuousDistributionContract(
  name: string,
  createSut: () => IContinuousProbabilityDistribution,
  xRange: readonly number[],
  sampleCount = 1_000,
): void {
  describe(`${name} contract`, () => {
    const fixture = new ProbabilityFixture();

    it("should sample finite values", () => {
      const sut = createSut();
      const values = fixture.sampleDistribution(sut, sampleCount);

      expect(values.length).toBe(sampleCount);

      for (const value of values) {
        expect(Number.isFinite(value)).toBe(true);
      }
    });

    it("should return a non-negative pdf across test points", () => {
      const sut = createSut();

      for (const x of xRange) {
        expect(sut.pdf(x)).toBeGreaterThanOrEqual(0);
      }
    });

    it("should produce a monotonic non-decreasing cdf across test points", () => {
      const sut = createSut();
      const values = xRange.map((x) => sut.cdf(x));

      fixture.assertMonotonicNonDecreasing(values);

      for (const cdf of values) {
        expect(cdf).toBeGreaterThanOrEqual(0);
        expect(cdf).toBeLessThanOrEqual(1);
      }
    });

    it("should approximately invert cdf with inverseCdf for representative probabilities", () => {
      const sut = createSut();
      const probabilities = [0.1, 0.25, 0.5, 0.75, 0.9];

      for (const probability of probabilities) {
        const x = sut.inverseCdf(probability);
        const cdf = sut.cdf(x);

        expect(cdf).toBeCloseTo(probability, 2);
      }
    });
  });
}

runContinuousDistributionContract(
  "TriangularDistribution",
  () => new ProbabilityFixture().createTriangularDistribution(),
  [10, 15, 20, 25, 30, 35, 40],
);

runContinuousDistributionContract(
  "BetaPertDistribution",
  () => new ProbabilityFixture().createPertDistribution(),
  [10, 15, 20, 25, 30, 35, 40],
);

runContinuousDistributionContract(
  "SkewNormalEstimateDistribution",
  () => new ProbabilityFixture().createSkewNormalEstimateDistribution(),
  [-20, -5, 0, 10, 20, 35, 60, 90],
);

runContinuousDistributionContract(
  "NormalDistribution",
  () => new ProbabilityFixture().createNormalDistribution(),
  [-3, -2, -1, 0, 1, 2, 3],
);
