
import { describe, expect, it } from "vitest";
import { EstimateRange } from "../src/index.js";

describe("EstimateRange", () => {
  it("should create a valid range when minimum <= mostLikely <= maximum", () => {
    const sut = new EstimateRange(8, 16, 40);

    expect(sut.minimum).toBe(8);
    expect(sut.mostLikely).toBe(16);
    expect(sut.maximum).toBe(40);
    expect(sut.span).toBe(32);
  });

  it("should reject invalid ordering", () => {
    expect(() => new EstimateRange(20, 10, 40)).toThrowError(RangeError);
  });

  it("should reject zero-span ranges", () => {
    expect(() => new EstimateRange(10, 10, 10)).toThrowError(RangeError);
  });
});

// =====================================================================================
// FILE: tests/value-objects/EstimateShape.spec.ts
// =====================================================================================
