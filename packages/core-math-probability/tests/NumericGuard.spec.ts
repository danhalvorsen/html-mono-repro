
// =====================================================================================
// FILE: tests/numerics/NumericGuard.spec.ts
// =====================================================================================

import { describe, expect, it } from "vitest";
import { NumericGuard } from "../src/index.js";

describe("NumericGuard", () => {
  it("should accept a finite number", () => {
    expect(() => NumericGuard.finite(1, "x")).not.toThrow();
  });

  it("should reject a non-finite number", () => {
    expect(() => NumericGuard.finite(Number.NaN, "x")).toThrowError(RangeError);
  });

  it("should reject a non-positive number when positive is required", () => {
    expect(() => NumericGuard.positive(0, "x")).toThrowError(RangeError);
  });

  it("should reject probabilities outside [0,1]", () => {
    expect(() => NumericGuard.probability(1.1, "x")).toThrowError(RangeError);
  });

  it("should reject open probability values outside (0,1)", () => {
    expect(() => NumericGuard.openProbability(0, "x")).toThrowError(RangeError);
  });
});

