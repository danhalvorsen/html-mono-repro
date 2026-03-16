// packages/core-specifications/tests/AndSpecification.spec.ts

import { beforeEach, describe, expect, it } from "vitest";
import { AndSpecification } from "../src/specifications/AndSpecification.js";
import { NotSpecification } from "../src/specifications/NotSpecification.js";
import { OrSpecification } from "../src/specifications/OrSpecification.js";
import { SpecificationsFixture } from "./fixtures/SpecificationsFixture.js";

describe("AndSpecification", () => {
  let fixture: SpecificationsFixture;

  beforeEach(() => {
    fixture = new SpecificationsFixture();
  });

  it("should return true when both specifications are satisfied", () => {
    const sut = new AndSpecification(
      fixture.valueGreaterThanFiveSpecification,
      fixture.enabledSpecification,
    );

    expect(sut.isSatisfiedBy(fixture.model)).toBe(true);
  });

  it("should return false when the left specification is not satisfied", () => {
    const sut = new AndSpecification(
      fixture.valueGreaterThanTenSpecification,
      fixture.enabledSpecification,
    );

    expect(sut.isSatisfiedBy(fixture.model)).toBe(false);
  });

  it("should return false when the right specification is not satisfied", () => {
    const sut = new AndSpecification(
      fixture.valueGreaterThanFiveSpecification,
      fixture.disabledSpecification,
    );

    expect(sut.isSatisfiedBy(fixture.model)).toBe(false);
  });

  it("should create an AndSpecification when and is chained", () => {
    const result = fixture.enabledSpecification.and(
      fixture.valueGreaterThanFiveSpecification,
    );

    expect(result).toBeInstanceOf(AndSpecification);
    expect(result.isSatisfiedBy(fixture.model)).toBe(true);
  });

  it("should create an OrSpecification when or is chained", () => {
    const sut = new AndSpecification(
      fixture.enabledSpecification,
      fixture.valueGreaterThanFiveSpecification,
    );

    const result = sut.or(fixture.disabledSpecification);

    expect(result).toBeInstanceOf(OrSpecification);
    expect(result.isSatisfiedBy(fixture.model)).toBe(true);
  });

  it("should create a NotSpecification when not is chained", () => {
    const sut = new AndSpecification(
      fixture.enabledSpecification,
      fixture.valueGreaterThanFiveSpecification,
    );

    const result = sut.not();

    expect(result).toBeInstanceOf(NotSpecification);
    expect(result.isSatisfiedBy(fixture.model)).toBe(false);
  });
});