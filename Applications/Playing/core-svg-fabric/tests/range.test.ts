import { describe, expect, it } from "vitest";
import { Range } from "../src/domain/range.js";

describe("Range", () => {
  it("clamps values to the range boundaries", () => {
    const range = new Range(10, 20);

    expect(range.clamp(5)).toBe(10);
    expect(range.clamp(15)).toBe(15);
    expect(range.clamp(25)).toBe(20);
  });

  it("normalizes clamped values", () => {
    const range = new Range(-100, 100);

    expect(range.normalize(-200)).toBe(0);
    expect(range.normalize(0)).toBe(0.5);
    expect(range.normalize(200)).toBe(1);
  });

  it("rejects invalid ranges", () => {
    expect(() => new Range(1, 1)).toThrow(/max must be > min/i);
    expect(() => new Range(Number.NaN, 1)).toThrow(/min must be finite/i);
  });
});
