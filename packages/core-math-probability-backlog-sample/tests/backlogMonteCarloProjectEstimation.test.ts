// tests/backlogMonteCarloProjectEstimation.test.ts

import { describe, it, expect } from "vitest";
import { BacklogAnalysisFixture } from "./BacklogAnalysisFixture.js";

describe("Backlog Monte Carlo project estimation", () => {
  it("should produce a project-level estimate report from repeated stochastic sampling", () => {
    const fixture = new BacklogAnalysisFixture();

    const result = fixture.analyze(undefined, 6_000, 20260323);

    // This verifies the core Monte Carlo contract:
    // the backlog is transformed into a project-level probabilistic estimate.
    expect(result.report).toBeDefined();
    expect(result.report.estimate).toBeDefined();
    expect(result.report.estimate.statistics).toBeDefined();
  });

  it("should expose the expected project-level statistics used for planning under uncertainty", () => {
    const fixture = new BacklogAnalysisFixture();

    const result = fixture.analyze(undefined, 6_000, 20260323);
    const statistics = result.report.estimate.statistics;
    const epsilon = 1e-10;

    // These are the key outputs consumers typically use from Monte Carlo:
    // mean, spread, extrema, and percentile-based confidence ranges.
    expect(Number.isFinite(statistics.mean)).toBe(true);
    expect(Number.isFinite(statistics.variance)).toBe(true);
    expect(Number.isFinite(statistics.standardDeviation)).toBe(true);
    expect(Number.isFinite(statistics.minimum)).toBe(true);
    expect(Number.isFinite(statistics.maximum)).toBe(true);
    expect(Number.isFinite(statistics.percentile50)).toBe(true);
    expect(Number.isFinite(statistics.percentile80)).toBe(true);
    expect(Number.isFinite(statistics.percentile90)).toBe(true);
    expect(Number.isFinite(statistics.percentile95)).toBe(true);

    expect(statistics.variance).toBeGreaterThanOrEqual(0);
    expect(statistics.standardDeviation).toBeGreaterThanOrEqual(0);

    expect(statistics.minimum).toBeLessThanOrEqual(statistics.maximum + epsilon);
    expect(statistics.mean).toBeGreaterThanOrEqual(statistics.minimum - epsilon);
    expect(statistics.mean).toBeLessThanOrEqual(statistics.maximum + epsilon);

    expect(statistics.percentile50).toBeLessThanOrEqual(statistics.percentile80 + epsilon);
    expect(statistics.percentile80).toBeLessThanOrEqual(statistics.percentile90 + epsilon);
    expect(statistics.percentile90).toBeLessThanOrEqual(statistics.percentile95 + epsilon);
  });

  it("should produce a non-degenerate distribution for the project total", () => {
    const fixture = new BacklogAnalysisFixture();

    const result = fixture.analyze(undefined, 6_000, 20260323);
    const statistics = result.report.estimate.statistics;

    // A Monte Carlo estimate should produce spread in the result.
    // If these collapse to a single value, stochastic sampling is effectively broken.
    expect(statistics.maximum).toBeGreaterThan(statistics.minimum);
    expect(statistics.standardDeviation).toBeGreaterThan(0);
  });

  it("should keep the median-like project percentile inside the sampled project envelope", () => {
    const fixture = new BacklogAnalysisFixture();

    const result = fixture.analyze(undefined, 6_000, 20260323);
    const statistics = result.report.estimate.statistics;
    const epsilon = 1e-10;

    // This verifies that percentile extraction is consistent with the sample envelope.
    expect(statistics.percentile50).toBeGreaterThanOrEqual(statistics.minimum - epsilon);
    expect(statistics.percentile50).toBeLessThanOrEqual(statistics.maximum + epsilon);
  });

  it("should produce feature-level project decomposition together with the overall Monte Carlo result", () => {
    const fixture = new BacklogAnalysisFixture();

    const result = fixture.analyze(undefined, 6_000, 20260323);

    // A useful project estimate should preserve feature granularity,
    // not only a single rolled-up project total.
    expect(result.report.features).toHaveLength(5);

    for (const feature of result.report.features) {
      expect(feature.id.length).toBeGreaterThan(0);
      expect(feature.name.length).toBeGreaterThan(0);
      expect(feature.estimate.statistics.mean).toBeGreaterThan(0);
    }
  });

  it("should be reproducible when the same seed and iteration count are reused", () => {
    const fixture = new BacklogAnalysisFixture();

    const left = fixture.analyze(undefined, 4_000, 77);
    const right = fixture.analyze(undefined, 4_000, 77);

    // Reproducibility matters for automated tests and for consumers
    // who want stable scenario comparisons.
    expect(left.report.estimate.statistics.mean).toBeCloseTo(
      right.report.estimate.statistics.mean,
      10,
    );

    expect(left.report.estimate.statistics.percentile90).toBeCloseTo(
      right.report.estimate.statistics.percentile90,
      10,
    );

    expect(left.report.estimate.statistics.percentile95).toBeCloseTo(
      right.report.estimate.statistics.percentile95,
      10,
    );
  });

  it("should change the simulated project outcome when the random seed changes", () => {
    const fixture = new BacklogAnalysisFixture();

    const left = fixture.analyze(undefined, 4_000, 77);
    const right = fixture.analyze(undefined, 4_000, 78);

    // This verifies that seeded randomness actually affects the simulation.
    // If this fails, the random source may not be wired into sampling correctly.
    expect(left.report.estimate.statistics.mean).not.toBeCloseTo(
      right.report.estimate.statistics.mean,
      12,
    );
  });
});