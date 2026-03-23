
import { specification, given, when, then, expect } from "./specification.js"

import { BacklogAnalysisFixture } from "./BacklogAnalysisFixture.js";

specification("BacklogProbabilityAnalyzer", () => {
  given("the oscillator backlog json fixture", () => {
    const fixture = new BacklogAnalysisFixture();

    when("the backlog is read from disk", () => {
      const backlog = fixture.readBacklog();

      then("the hierarchy should be available for estimation learning scenarios", () => {
        expect(backlog.epics).toHaveLength(1);
        expect(backlog.epics[0].features).toHaveLength(5);
      });
    });

    when("the backlog is analyzed through the probability module", () => {
      const result = fixture.analyze();

      then("the structural counts should match the source backlog", () => {
        expect(result.counts.epicCount).toBe(1);
        expect(result.counts.featureCount).toBe(5);
        expect(result.counts.userStoryCount).toBe(6);
        expect(result.counts.taskCount).toBe(24);
      });

      then("the deterministic baseline should be internally consistent", () => {
        expect(result.deterministic.optimisticHours).toBeLessThan(result.deterministic.pertWeightedHours);
        expect(result.deterministic.pertWeightedHours).toBeLessThan(result.deterministic.pessimisticHours);
      });

      then("the monte carlo report should expose ordered percentiles", () => {
        const statistics = result.report.estimate.statistics;

        expect(statistics.percentile50).toBeLessThanOrEqual(statistics.percentile80);
        expect(statistics.percentile80).toBeLessThanOrEqual(statistics.percentile90);
        expect(statistics.percentile90).toBeLessThanOrEqual(statistics.percentile95);
      });

      then("the mean should stay within the sampled envelope", () => {
        const statistics = result.report.estimate.statistics;

        expect(statistics.mean).toBeGreaterThanOrEqual(statistics.minimum);
        expect(statistics.mean).toBeLessThanOrEqual(statistics.maximum);
      });

      then("the report should include a feature-level breakdown", () => {
        expect(result.report.features).toHaveLength(5);
      });

      then("the task type breakdown should expose both DEV and UX totals", () => {
        const taskTypes = result.byTaskType.map((item) => item.taskType);

        expect(taskTypes).toContain("DEV");
        expect(taskTypes).toContain("UX");
      });

      then("the markdown report should be readable and reusable", () => {
        expect(result.markdown).toContain("# Backlog probability analysis");
        expect(result.markdown).toContain("## Deterministic baseline");
        expect(result.markdown).toContain("## Monte Carlo project estimate");
      });
    });

    when("the same seed is reused", () => {
      const left = fixture.analyze(undefined, 4_000, 77);
      const right = fixture.analyze(undefined, 4_000, 77);

      then("the analysis should stay deterministic across repeated runs", () => {
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
  });
});