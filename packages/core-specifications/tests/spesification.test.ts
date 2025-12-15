import { describe, expect, it } from "vitest";
import { AndSpecification } from "../src/specifications/AndSpecification.js";
import { NotSpecification } from "../src/specifications/NotSpecification.js";
import { OrSpecification } from "../src/specifications/OrSpecification.js";
import type { ISpecification } from "../src/specifications/ISpecification.js";

const makeSpec = <T>(result: boolean): ISpecification<T> => ({
  isSatisfiedBy: () => result,
  and(other) {
    return new AndSpecification(this, other);
  },
  or(other) {
    return new OrSpecification(this, other);
  },
  not() {
    return new NotSpecification(this);
  }
});

describe("Specifications", () => {
  const trueSpec = makeSpec<string>(true);
  const falseSpec = makeSpec<string>(false);

  it("evaluates AndSpecification correctly", () => {
    expect(new AndSpecification(trueSpec, trueSpec).isSatisfiedBy("x")).toBe(true);
    expect(new AndSpecification(trueSpec, falseSpec).isSatisfiedBy("x")).toBe(false);
    expect(new AndSpecification(falseSpec, trueSpec).isSatisfiedBy("x")).toBe(false);
    expect(new AndSpecification(falseSpec, falseSpec).isSatisfiedBy("x")).toBe(false);
  });

  it("evaluates OrSpecification correctly", () => {
    expect(new OrSpecification(trueSpec, trueSpec).isSatisfiedBy("x")).toBe(true);
    expect(new OrSpecification(trueSpec, falseSpec).isSatisfiedBy("x")).toBe(true);
    expect(new OrSpecification(falseSpec, trueSpec).isSatisfiedBy("x")).toBe(true);
    expect(new OrSpecification(falseSpec, falseSpec).isSatisfiedBy("x")).toBe(false);
  });

  it("evaluates NotSpecification correctly", () => {
    expect(new NotSpecification(trueSpec).isSatisfiedBy("x")).toBe(false);
    expect(new NotSpecification(falseSpec).isSatisfiedBy("x")).toBe(true);
  });

  it("supports fluent chaining", () => {
    // (true AND false) OR true => true
    const chained = trueSpec.and(falseSpec).or(trueSpec);
    expect(chained.isSatisfiedBy("x")).toBe(true);

    // NOT(true OR false) => false
    const chainedNot = trueSpec.or(falseSpec).not();
    expect(chainedNot.isSatisfiedBy("x")).toBe(false);

    // double NOT unwraps to original via NotSpecification.not()
    const doubleNot = new NotSpecification(trueSpec).not();
    expect(doubleNot).toBe(trueSpec);
  });
});
