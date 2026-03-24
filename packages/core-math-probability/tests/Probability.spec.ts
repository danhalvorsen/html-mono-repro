
import { describe, expect, it } from "vitest";
import { Probability } from "../src/index.js";

describe("Probability", () => {
  it("should create a valid probability when value is in range", () => {
    const sut = Probability.create(0.75);

    expect(sut.value).toBe(0.75);
  });

  it("should reject values below zero", () => {
    expect(() => Probability.create(-0.01)).toThrowError(RangeError);
  });

  it("should reject values above one", () => {
    expect(() => Probability.create(1.01)).toThrowError(RangeError);
  });
});

// =====================================================================================
// FILE: tests/value-objects/PositiveNumber.spec.ts
// =====================================================================================
