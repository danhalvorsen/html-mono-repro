 
import { describe, expect, it } from "vitest";
import {
  PidFragmentKindSpecification,
  PidFragmentPageNumberSpecification,
  PidFragmentKinds,
  PidTagConfidenceAtLeastSpecification,
  PidTagTextContainsSpecification,
  PidTagTextMatchesSpecification,
} from "../src/index.js";
import { PidDomainFixture } from "./fixtures/PidDomainFixture.js";

describe("PID fragment specifications", () => {
  const fixture = new PidDomainFixture();

  it("should match PID fragment by kind", () => {
    const candidate = fixture.createEquipmentTag("P-101");
    const specification = new PidFragmentKindSpecification(PidFragmentKinds.EquipmentTag);

    expect(specification.isSatisfiedBy(candidate)).toBe(true);
  });

  it("should reject PID fragment when kind does not match", () => {
    const candidate = fixture.createInstrumentTag("PT-101");
    const specification = new PidFragmentKindSpecification(PidFragmentKinds.EquipmentTag);

    expect(specification.isSatisfiedBy(candidate)).toBe(false);
  });

  it("should match PID fragment by page number", () => {
    const candidate = fixture.createTagCandidate("P-101");
    const specification = new PidFragmentPageNumberSpecification(1);

    expect(specification.isSatisfiedBy(candidate)).toBe(true);
  });

  it("should reject invalid expected page number", () => {
    expect(() => new PidFragmentPageNumberSpecification(0)).toThrow(
      "expectedPageNumber must be an integer >= 1.",
    );
  });

  it("should match tag text using normalized contains", () => {
    const candidate = fixture.createTagCandidate("  p-101  ");
    const specification = new PidTagTextContainsSpecification("p-");

    expect(specification.isSatisfiedBy(candidate)).toBe(true);
  });

  it("should reject empty contains needle", () => {
    expect(() => new PidTagTextContainsSpecification(" ")).toThrow(
      "needle must not be empty.",
    );
  });

  it("should match tag text using regex", () => {
    const candidate = fixture.createTagCandidate("PT-101");
    const specification = new PidTagTextMatchesSpecification(/^PT-\d+$/u);

    expect(specification.isSatisfiedBy(candidate)).toBe(true);
  });

  it("should match tag by minimum confidence", () => {
    const candidate = fixture.createTagCandidate("P-101", 0.8);
    const specification = new PidTagConfidenceAtLeastSpecification(0.75);

    expect(specification.isSatisfiedBy(candidate)).toBe(true);
  });

  it("should reject invalid minimum confidence", () => {
    expect(() => new PidTagConfidenceAtLeastSpecification(1.1)).toThrow(
      "minimumConfidence must be a finite number between 0 and 1.",
    );
  });

  it("should support chained specification expressions", () => {
    const candidate = fixture.createTagCandidate("P-101", 0.9);

    const specification = new PidTagTextContainsSpecification("P-")
      .and(new PidTagConfidenceAtLeastSpecification(0.8))
      .and(new PidTagTextMatchesSpecification(/^P-\d+$/u));

    expect(specification.isSatisfiedBy(candidate)).toBe(true);
  });

  it("should support negated specification expressions", () => {
    const candidate = fixture.createTagCandidate("P-101");
    const specification = new PidTagTextContainsSpecification("VALVE").not();

    expect(specification.isSatisfiedBy(candidate)).toBe(true);
  });
});
