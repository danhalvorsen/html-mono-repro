import { describe, expect, it } from "vitest";
import { RectTransform2D } from "../src/RectTransform2D.js";

describe("RectTransform2D", () => {
  it("should apply translation", () => {
    const transform = new RectTransform2D(3, 4, 0);
    const result = transform.apply({ x: 1, y: 2, z: 0 });

    expect(result.x).toBeCloseTo(4, 8);
    expect(result.y).toBeCloseTo(6, 8);
    expect(result.z).toBe(0);
  });

  it("should apply rotation", () => {
    const transform = new RectTransform2D(0, 0, 90);
    const result = transform.apply({ x: 1, y: 0, z: 5 });

    expect(result.x).toBeCloseTo(0, 8);
    expect(result.y).toBeCloseTo(1, 8);
    expect(result.z).toBe(5);
  });

  it("should reject invalid translation", () => {
    expect(() => new RectTransform2D(Number.NaN, 0, 0)).toThrowError("translateX must be finite.");
  });
});
