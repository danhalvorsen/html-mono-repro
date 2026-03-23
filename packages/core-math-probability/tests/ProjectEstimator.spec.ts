// =====================================================================================
// FILE: tests/application/ProjectEstimator.spec.ts
// =====================================================================================

import { describe, expect, it } from "vitest";
import {
  ProbabilityEstimationCompositionRoot,
  ProbabilityEstimationFixture,
} from "../src/index.js"

describe("ProjectEstimator", () => {
  it("should estimate a project with mixed distributions", () => {
    const fixture = new ProbabilityEstimationFixture();
    const sut = ProbabilityEstimationCompositionRoot.createProjectEstimator();
    const report = sut.estimate(
      fixture.createProject(),
      3_000,
      fixture.createRandom(42),
    );

    expect(report.id).toBe("project-spaceship");
    expect(report.features).toHaveLength(2);
    expect(report.estimate.statistics.mean).toBeGreaterThan(0);
    expect(report.estimate.statistics.percentile95).toBeGreaterThanOrEqual(report.estimate.statistics.percentile90);
  });

  it("should reject non-positive iteration counts", () => {
    const fixture = new ProbabilityEstimationFixture();
    const sut = ProbabilityEstimationCompositionRoot.createProjectEstimator();

    expect(() =>
      sut.estimate(
        fixture.createProject(),
        0,
        fixture.createRandom(42),
      ),
    ).toThrowError(RangeError);
  });
});
