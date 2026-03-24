
import { describe, expect, it } from "vitest";
import { Sample } from "../src/index.js";

describe("Sample", () => {
  it("should create a sample when values are finite and non-empty", () => {
    const sut = new Sample([1, 2, 3]);

    expect(sut.values).toEqual([1, 2, 3]);
  });

  it("should reject empty samples", () => {
    expect(() => new Sample([])).toThrowError(RangeError);
  });

  it("should reject non-finite values", () => {
    expect(() => new Sample([1, Number.NaN])).toThrowError(RangeError);
  });
});
