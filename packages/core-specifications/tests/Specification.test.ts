// packages/core-specifications/tests/Specification.spec.ts

import { describe, expect, it } from "vitest";
import { AndSpecification } from "../src/specifications/AndSpecification.js";
import { NotSpecification } from "../src/specifications/NotSpecification.js";
import { OrSpecification } from "../src/specifications/OrSpecification.js";
import { Specification } from "../src/specifications/Specification.js";

interface ITestModel {
  readonly value: number;
}

class EvenSpecification extends Specification<ITestModel> {
  public isSatisfiedBy(candidate: ITestModel): boolean {
    return candidate.value % 2 === 0;
  }
}

describe("Specification", () => {
  it("should create an AndSpecification from and", () => {
    const sut = new EvenSpecification();

    expect(sut.and(new EvenSpecification())).toBeInstanceOf(AndSpecification);
  });

  it("should create an OrSpecification from or", () => {
    const sut = new EvenSpecification();

    expect(sut.or(new EvenSpecification())).toBeInstanceOf(OrSpecification);
  });

  it("should create a NotSpecification from not", () => {
    const sut = new EvenSpecification();

    expect(sut.not()).toBeInstanceOf(NotSpecification);
  });
});