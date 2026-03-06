import { describe, it, expect } from "vitest";
import { StringShapeTypeFactory } from "../src/index.js";

describe("StringShapeTypeFactory", () => {
  it("creates ShapeType from trimmed value", () => {
    const sut = new StringShapeTypeFactory();

    const result = sut.create("  sphere  ");

    expect(result).toBe("sphere");
  });

  it("throws when value is empty", () => {
    const sut = new StringShapeTypeFactory();

    expect(() => sut.create("   ")).toThrowError("Shape type cannot be empty.");
  });
});