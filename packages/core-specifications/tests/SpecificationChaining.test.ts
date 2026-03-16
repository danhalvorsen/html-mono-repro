// packages/core-specifications/tests/SpecificationChaining.spec.ts

import { describe, expect, it } from "vitest";
import { Specification } from "../src/specifications/Specification.js";
import { AndSpecification } from "../src/specifications/AndSpecification.js";
import { OrSpecification } from "../src/specifications/OrSpecification.js";
import { NotSpecification } from "../src/specifications/NotSpecification.js";

interface IModel {
  readonly value: number;
  readonly enabled: boolean;
}

class EnabledSpecification extends Specification<IModel> {
  public isSatisfiedBy(candidate: IModel): boolean {
    return candidate.enabled;
  }
}

class ValueGreaterThanSpecification extends Specification<IModel> {
  public constructor(private readonly threshold: number) {
    super();
  }

  public isSatisfiedBy(candidate: IModel): boolean {
    return candidate.value > this.threshold;
  }
}

describe("Specification chaining", () => {
  it("should chain and then or", () => {
    const model: IModel = { value: 10, enabled: true };

    const sut = new EnabledSpecification()
      .and(new ValueGreaterThanSpecification(5))
      .or(new ValueGreaterThanSpecification(100));

    expect(sut.isSatisfiedBy(model)).toBe(true);
  });

  it("should chain and then not", () => {
    const model: IModel = { value: 10, enabled: true };

    const sut = new EnabledSpecification()
      .and(new ValueGreaterThanSpecification(5))
      .not();

    expect(sut.isSatisfiedBy(model)).toBe(false);
  });

  it("should chain not then or", () => {
    const model: IModel = { value: 10, enabled: true };

    const sut = new EnabledSpecification()
      .not()
      .or(new ValueGreaterThanSpecification(5));

    expect(sut.isSatisfiedBy(model)).toBe(true);
  });

  it("should support deep fluent chaining", () => {
    const model: IModel = { value: 10, enabled: true };

    const sut = new EnabledSpecification()
      .and(new ValueGreaterThanSpecification(5))
      .or(new ValueGreaterThanSpecification(100))
      .and(new EnabledSpecification())
      .not()
      .not();

    expect(sut.isSatisfiedBy(model)).toBe(true);
  });

  it("should return composite specifications during chaining", () => {
    const andSpec = new EnabledSpecification()
      .and(new ValueGreaterThanSpecification(5));

    const orSpec = andSpec.or(new ValueGreaterThanSpecification(100));
    const notSpec = orSpec.not();

    expect(andSpec).toBeInstanceOf(AndSpecification);
    expect(orSpec).toBeInstanceOf(OrSpecification);
    expect(notSpec).toBeInstanceOf(NotSpecification);
  });

  it("should preserve logical grouping from left to right chaining", () => {
    const model: IModel = { value: 1, enabled: true };

    const sut = new EnabledSpecification()
      .and(new ValueGreaterThanSpecification(5))
      .or(new ValueGreaterThanSpecification(0));

    expect(sut.isSatisfiedBy(model)).toBe(true);
  });
});