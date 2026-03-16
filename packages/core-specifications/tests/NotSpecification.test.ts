// packages/core-specifications/tests/NotSpecification.spec.ts

import { beforeEach, describe, expect, it } from "vitest";
import { AndSpecification } from "../src/specifications/AndSpecification.js";
import { NotSpecification } from "../src/specifications/NotSpecification.js";
import { OrSpecification } from "../src/specifications/OrSpecification.js";
import { SpecificationsFixture } from "./fixtures/SpecificationsFixture.js";

describe("NotSpecification", () => {
  let fixture: SpecificationsFixture;

  beforeEach(() => {
    fixture = new SpecificationsFixture();
  });

  it("should invert a satisfied specification", () => {
    const sut = new NotSpecification(fixture.enabledSpecification);

    expect(sut.isSatisfiedBy(fixture.model)).toBe(false);
  });

  it("should invert a non satisfied specification", () => {
    const sut = new NotSpecification(fixture.disabledSpecification);

    expect(sut.isSatisfiedBy(fixture.model)).toBe(true);
  });

  it("should return the inner specification when not is called twice", () => {
    const inner = fixture.enabledSpecification;
    const sut = new NotSpecification(inner);

    expect(sut.not()).toBe(inner);
  });

  it("should create an AndSpecification when and is chained", () => {
    const sut = new NotSpecification(fixture.disabledSpecification);

    const result = sut.and(fixture.valueGreaterThanFiveSpecification);

    expect(result).toBeInstanceOf(AndSpecification);
  });

  it("should create an OrSpecification when or is chained", () => {
    const sut = new NotSpecification(fixture.enabledSpecification);

    const result = sut.or(fixture.disabledSpecification);

    expect(result).toBeInstanceOf(OrSpecification);
  });
});