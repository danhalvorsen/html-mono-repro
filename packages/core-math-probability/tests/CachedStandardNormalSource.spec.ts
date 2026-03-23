
import { describe, expect, it } from "vitest";
import {
  CachedStandardNormalSource,
  Mulberry32RandomSource,
} from "../src/index.js";

describe("CachedStandardNormalSource", () => {
  it("should return finite values", () => {
    const sut = new CachedStandardNormalSource(new Mulberry32RandomSource(123));

    const values = Array.from({ length: 1000 }, () => sut.next());

    for (const value of values) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("should produce deterministic output for the same seed", () => {
    const left = new CachedStandardNormalSource(new Mulberry32RandomSource(123));
    const right = new CachedStandardNormalSource(new Mulberry32RandomSource(123));

    const leftValues = Array.from({ length: 10 }, () => left.next());
    const rightValues = Array.from({ length: 10 }, () => right.next());

    expect(leftValues).toEqual(rightValues);
  });
});
