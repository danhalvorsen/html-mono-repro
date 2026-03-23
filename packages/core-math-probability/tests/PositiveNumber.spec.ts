
import { describe, expect, it } from "vitest";
import { PositiveNumber } from "../src/index.js";

describe("PositiveNumber", () => {
  it("should create a positive number when value is valid", () => {
    const sut = PositiveNumber.create(3, "value");

    expect(sut.value).toBe(3);
  });

  it("should reject zero", () => {
    expect(() => PositiveNumber.create(0, "value")).toThrowError(RangeError);
  });

  it("should reject negative values", () => {
    expect(() => PositiveNumber.create(-1, "value")).toThrowError(RangeError);
  });
});
 