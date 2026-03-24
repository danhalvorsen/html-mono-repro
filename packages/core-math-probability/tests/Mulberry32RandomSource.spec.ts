
// =====================================================================================
// FILE: tests/random/Mulberry32RandomSource.spec.ts
// =====================================================================================

import { describe, expect, it } from "vitest";
import { Mulberry32RandomSource } from "../src/index.js";

describe("Mulberry32RandomSource", () => {
  it("should return deterministic output for the same seed", () => {
    const left = new Mulberry32RandomSource(42);
    const right = new Mulberry32RandomSource(42);

    const leftValues = Array.from({ length: 5 }, () => left.next());
    const rightValues = Array.from({ length: 5 }, () => right.next());

    expect(leftValues).toEqual(rightValues);
  });

  it("should return values in [0,1)", () => {
    const sut = new Mulberry32RandomSource(42);

    for (let index = 0; index < 1_000; index += 1) {
      const value = sut.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("should reject non-integer seeds", () => {
    expect(() => new Mulberry32RandomSource(1.5)).toThrowError(RangeError);
  });
});

// =====================================================================================
// FILE: tests/random/CachedStandardNormalSource.spec.ts
// =====================================================================================
