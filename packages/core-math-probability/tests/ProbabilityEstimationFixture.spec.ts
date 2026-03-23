// =====================================================================================
// FILE: tests/fixtures/ProbabilityEstimationFixture.spec.ts
// =====================================================================================

import { ProbabilityEstimationFixture } from "../src/index.js"
import { describe, expect, it } from "vitest";
 
describe("ProbabilityEstimationFixture", () => {
  it("should create deterministic random sources", () => {
    const fixture = new ProbabilityEstimationFixture();
    const left = fixture.createRandom(12);
    const right = fixture.createRandom(12);

    expect(left.next()).toBe(right.next());
  });

  it("should create a project with features", () => {
    const fixture = new ProbabilityEstimationFixture();
    const project = fixture.createProject();

    expect(project.features.length).toBeGreaterThan(0);
  });

  it("should create a known descriptive sample", () => {
    const fixture = new ProbabilityEstimationFixture();
    const sample = fixture.createSample();

    expect(sample.values).toEqual([2, 4, 4, 4, 5, 5, 7, 9]);
  });
});