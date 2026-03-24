// tests/ProjectEstimator.synthetic-aggregation-defect.spec.ts

import { describe, it, expect } from "vitest";
import {
  ProbabilityEstimationCompositionRoot,
  ProbabilityEstimationFixture,
} from "../src/index.js";

describe("ProjectEstimator synthetic aggregation defect", () => {
  it("should not collapse rolled-up uncertainty into a tiny set of repeated anchor totals", () => {
    const fixture = new ProbabilityEstimationFixture();
    const estimator = ProbabilityEstimationCompositionRoot.createProjectEstimator();

    const project = fixture.createProject();
    const random = fixture.createRandom(77);

    const report = estimator.estimate(project, 8_000, random);

    const projectStats = report.estimate.statistics;
    const featureStats = report.features[0].estimate.statistics;
    const storyStats = report.features[0].stories[0].estimate.statistics;
    const taskStats = report.features[0].stories[0].tasks[0].estimate.statistics;

    // Control: task-level simulation is genuinely stochastic.
    expect(taskStats.standardDeviation).toBeGreaterThan(0);
    expect(taskStats.maximum).toBeGreaterThan(taskStats.minimum);
    expect(taskStats.percentile50).toBeLessThan(taskStats.percentile95);

    // Rolled-up levels should also preserve meaningful spread.
    expect(storyStats.standardDeviation).toBeGreaterThan(0);
    expect(featureStats.standardDeviation).toBeGreaterThan(0);
    expect(projectStats.standardDeviation).toBeGreaterThan(0);

    // Defect probe:
    // With correct Monte Carlo aggregation, these percentile gaps should be meaningfully positive.
    // With the current synthetic aggregateReports() implementation, some or all gaps collapse to zero.
    const storyP50to95 = storyStats.percentile95 - storyStats.percentile50;
    const featureP50to95 = featureStats.percentile95 - featureStats.percentile50;
    const projectP50to95 = projectStats.percentile95 - projectStats.percentile50;

    expect(storyP50to95).toBeGreaterThan(0.25);
    expect(featureP50to95).toBeGreaterThan(0.25);
    expect(projectP50to95).toBeGreaterThan(0.25);
  });

  it("should not produce rolled-up percentiles that are nearly identical while task-level spread is non-trivial", () => {
    const fixture = new ProbabilityEstimationFixture();
    const estimator = ProbabilityEstimationCompositionRoot.createProjectEstimator();

    const project = fixture.createProject();
    const random = fixture.createRandom(77);

    const report = estimator.estimate(project, 8_000, random);

    const storyStats = report.features[0].stories[0].estimate.statistics;
    const projectStats = report.estimate.statistics;
    const taskStats = report.features[0].stories[0].tasks[0].estimate.statistics;

    const taskSpread = taskStats.percentile95 - taskStats.percentile50;
    const storySpread = storyStats.percentile95 - storyStats.percentile50;
    const projectSpread = projectStats.percentile95 - projectStats.percentile50;

    // Control: the task itself clearly has uncertainty.
    expect(taskSpread).toBeGreaterThan(1);

    // Defect:
    // rolled-up spreads should not collapse toward zero when child distributions are stochastic.
    expect(storySpread).toBeGreaterThan(1);
    expect(projectSpread).toBeGreaterThan(1);
  });
});