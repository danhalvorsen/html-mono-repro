 
 import { describe, expect, it } from "vitest";
import { ProbabilityEstimationCompositionRoot 
  } from "../src/index.js"
describe("ProbabilityEstimationCompositionRoot", () => {
  it("should create a project estimator", () => {
    const sut = ProbabilityEstimationCompositionRoot.createProjectEstimator();

    expect(sut).toBeDefined();
  });

  it("should create a distribution factory", () => {
    const sut = ProbabilityEstimationCompositionRoot.createDistributionFactory();

    expect(sut).toBeDefined();
  });

  it("should create a report builder", () => {
    const sut = ProbabilityEstimationCompositionRoot.createReportBuilder();

    expect(sut).toBeDefined();
  });

  it("should create z-test and t-test services", () => {
    expect(ProbabilityEstimationCompositionRoot.createZTest()).toBeDefined();
    expect(ProbabilityEstimationCompositionRoot.createTTest()).toBeDefined();
  });
});

