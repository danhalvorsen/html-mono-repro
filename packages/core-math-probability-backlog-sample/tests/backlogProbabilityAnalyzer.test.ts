import { describe, it, expect } from "vitest";
import { BacklogAnalysisFixture } from "./BacklogAnalysisFixture.js";

describe("BacklogProbabilityAnalyzer", () => {
  it("should load the sample backlog fixture from disk so analysis can run on structured project data", () => {
    const fixture = new BacklogAnalysisFixture();

    // This verifies that the JSON fixture can be loaded and parsed into the
    // expected backlog contract. If this fails, the issue is usually:
    // - wrong file path
    // - malformed JSON
    // - mismatch between JSON and the TypeScript contract
    const backlog = fixture.readBacklog();

    expect(backlog.epics).toHaveLength(1);
    expect(backlog.epics[0].features).toHaveLength(5);
  });

  it("should calculate the expected structural counts from the backlog hierarchy", () => {
    const fixture = new BacklogAnalysisFixture();
    const result = fixture.analyze();

    // This verifies that the analyzer walks the hierarchy correctly:
    // epic -> feature -> story -> task.
    // These counts are deterministic and should not depend on Monte Carlo sampling.
    expect(result.counts.epicCount).toBe(1);
    expect(result.counts.featureCount).toBe(5);
    expect(result.counts.userStoryCount).toBe(6);
    expect(result.counts.taskCount).toBe(24);
  });

  it("should keep the deterministic PERT-style baseline between optimistic and pessimistic totals", () => {
    const fixture = new BacklogAnalysisFixture();
    const result = fixture.analyze();

    // The deterministic summary is a sanity check over the raw task estimates.
    // A weighted estimate should sit between the optimistic and pessimistic totals.
    expect(result.deterministic.optimisticHours).toBeLessThan(
      result.deterministic.pertWeightedHours,
    );
    expect(result.deterministic.pertWeightedHours).toBeLessThan(
      result.deterministic.pessimisticHours,
    );
  });

  it("should produce percentiles in non-decreasing order", () => {
    const fixture = new BacklogAnalysisFixture();
    const result = fixture.analyze();

    const statistics = result.report.estimate.statistics;
    const epsilon = 1e-10;

    // Percentiles represent increasingly conservative estimates.
    // Because these are floating-point values derived from sampling,
    // a small epsilon is used to avoid false failures caused by rounding noise.
    expect(statistics.percentile50).toBeLessThanOrEqual(statistics.percentile80 + epsilon);
    expect(statistics.percentile80).toBeLessThanOrEqual(statistics.percentile90 + epsilon);
    expect(statistics.percentile90).toBeLessThanOrEqual(statistics.percentile95 + epsilon);
  });

  it("should keep the sampled mean inside the observed sample range", () => {
    const fixture = new BacklogAnalysisFixture();
    const result = fixture.analyze();

    const statistics = result.report.estimate.statistics;
    const epsilon = 1e-10;

    // The sample mean should never fall outside the sampled minimum/maximum envelope.
    // This is a basic statistical sanity check on the generated report.
    expect(statistics.mean).toBeGreaterThanOrEqual(statistics.minimum - epsilon);
    expect(statistics.mean).toBeLessThanOrEqual(statistics.maximum + epsilon);
  });

  it("should return a feature-level breakdown so consumers can inspect estimate distribution per feature", () => {
    const fixture = new BacklogAnalysisFixture();
    const result = fixture.analyze();

    // This verifies that the analyzer preserves feature granularity in the output report.
    expect(result.report.features).toHaveLength(5);
  });

  it("should aggregate task totals by task type so consumers can compare DEV and UX effort", () => {
    const fixture = new BacklogAnalysisFixture();
    const result = fixture.analyze();

    // This verifies that task grouping works across the whole backlog,
    // independent of feature and story boundaries.
    const taskTypes = result.byTaskType.map((item) => item.taskType);

    expect(taskTypes).toContain("DEV");
    expect(taskTypes).toContain("UX");
  });

  it("should generate a markdown summary suitable for documentation or reporting", () => {
    const fixture = new BacklogAnalysisFixture();
    const result = fixture.analyze();

    // This verifies the report rendering contract, not the numeric engine itself.
    // If this fails, the analysis may still be correct while the presentation layer changed.
    expect(result.markdown).toContain("# Backlog probability analysis");
    expect(result.markdown).toContain("## Deterministic baseline");
    expect(result.markdown).toContain("## Monte Carlo project estimate");
  });

  it("should return deterministic Monte Carlo results when the same seed and iteration count are reused", () => {
    const fixture = new BacklogAnalysisFixture();

    // Seeded random sources are important for reproducible analysis
    // and stable automated tests.
    const left = fixture.analyze(undefined, 4_000, 77);
    const right = fixture.analyze(undefined, 4_000, 77);

    expect(left.report.estimate.statistics.mean).toBeCloseTo(
      right.report.estimate.statistics.mean,
      10,
    );

    expect(left.report.estimate.statistics.percentile90).toBeCloseTo(
      right.report.estimate.statistics.percentile90,
      10,
    );
  });
});