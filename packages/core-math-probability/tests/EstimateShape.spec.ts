
import { describe, expect, it } from "vitest";
import { EstimateShape } from "../src/index.js";

describe("EstimateShape", () => {
  it("should create a valid shape", () => {
    const sut = new EstimateShape(0.7, 0.2, 1.4);

    expect(sut.confidence).toBe(0.7);
    expect(sut.optimismBias).toBe(0.2);
    expect(sut.tailWeight).toBe(1.4);
  });

  it("should reject confidence outside [0,1]", () => {
    expect(() => new EstimateShape(1.1, 0, 1)).toThrowError(RangeError);
  });

  it("should reject optimismBias outside [-1,1]", () => {
    expect(() => new EstimateShape(0.5, 1.1, 1)).toThrowError(RangeError);
  });

  it("should reject non-positive tail weight", () => {
    expect(() => new EstimateShape(0.5, 0, 0)).toThrowError(RangeError);
  });
});

// =====================================================================================
// FILE: tests/value-objects/Sample.spec.ts
// =====================================================================================
