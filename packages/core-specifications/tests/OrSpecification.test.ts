// packages/core-specifications/tests/OrSpecification.spec.ts

import { beforeEach, describe, expect, it } from "vitest";
import { AndSpecification } from "../src/specifications/AndSpecification.js";
import { NotSpecification } from "../src/specifications/NotSpecification.js";
import { OrSpecification } from "../src/specifications/OrSpecification.js";
import { SpecificationsFixture } from "./fixtures/SpecificationsFixture.js";

describe("OrSpecification", () => {
  let fixture: SpecificationsFixture;

  beforeEach(() => {
    fixture = new SpecificationsFixture();
  });

  it("should return true when the left specification is satisfied", () => {
    const sut = new OrSpecification(
      fixture.enabledSpecification,
      fixture.valueGreaterThanTenSpecification,
    );

    expect(sut.isSatisfiedBy(fixture.model)).toBe(true);
  });

  it("should return true when the right specification is satisfied", () => {
    const sut = new OrSpecification(
      fixture.valueGreaterThanTenSpecification,
      fixture.enabledSpecification,
    );

    expect(sut.isSatisfiedBy(fixture.model)).toBe(true);
  });

  it("should return false when neither specification is satisfied", () => {
    const sut = new OrSpecification(
      fixture.valueGreaterThanTenSpecification,
      fixture.disabledSpecification,
    );

    expect(sut.isSatisfiedBy(fixture.model)).toBe(false);
  });

  it("should create an AndSpecification when and is chained", () => {
    const sut = new OrSpecification(
      fixture.enabledSpecification,
      fixture.disabledSpecification,
    );

    const result = sut.and(fixture.valueGreaterThanFiveSpecification);

    expect(result).toBeInstanceOf(AndSpecification);
  });

  it("should create a NotSpecification when not is chained", () => {
    const sut = new OrSpecification(
      fixture.enabledSpecification,
      fixture.disabledSpecification,
    );

    const result = sut.not();

    expect(result).toBeInstanceOf(NotSpecification);
  });
});