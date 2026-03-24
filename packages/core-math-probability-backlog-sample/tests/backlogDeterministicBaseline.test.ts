import { describe, it, expect } from "vitest";
import { BacklogAnalysisFixture } from "./BacklogAnalysisFixture.js";

describe("Backlog deterministic baseline", () => {
  it("should match the published deterministic totals for the sample backlog", () => {
    const fixture = new BacklogAnalysisFixture();
    const result = fixture.analyze();

    expect(result.deterministic.optimisticHours).toBe(90);
    expect(result.deterministic.mostLikelyHours).toBe(158);
    expect(result.deterministic.pessimisticHours).toBe(270);
    expect(result.deterministic.pertWeightedHours).toBeCloseTo(165.3333333333, 10);
  });

  it("should derive deterministic totals by summing task three-point estimates", () => {
    const fixture = new BacklogAnalysisFixture();
    const backlog = fixture.readBacklog();

    let optimisticHours = 0;
    let mostLikelyHours = 0;
    let pessimisticHours = 0;
    let weightedHours = 0;

    for (const epic of backlog.epics) {
      for (const feature of epic.features) {
        for (const story of feature.userStories) {
          for (const task of story.tasks) {
            optimisticHours += task.estimate.optimistic;
            mostLikelyHours += task.estimate.mostLikely;
            pessimisticHours += task.estimate.pessimistic;
            weightedHours += (
              task.estimate.optimistic +
              4 * task.estimate.mostLikely +
              task.estimate.pessimistic
            ) / 6;
          }
        }
      }
    }

    expect(optimisticHours).toBe(90);
    expect(mostLikelyHours).toBe(158);
    expect(pessimisticHours).toBe(270);
    expect(weightedHours).toBeCloseTo(165.3333333333, 10);
  });
});