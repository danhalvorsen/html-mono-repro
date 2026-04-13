import { describe, expect, it } from "vitest";
import { RectSemantic } from "../src/RectSemantic.js";
import { RectSemanticRegistry } from "../src/RectSemanticRegistry.js";

describe("RectSemanticRegistry", () => {
  it("should return coordinates for a valid semantic point", () => {
    const coordinates = RectSemanticRegistry.getCoordinates(RectSemantic.Top.Left);
    expect(coordinates).toEqual([-1, 1]);
  });

  it("should return the opposite semantic point", () => {
    const opposite = RectSemanticRegistry.getOpposite(RectSemantic.Right.End);
    expect(opposite).toBe(RectSemantic.Left.End);
  });

  it("should report valid semantic points", () => {
    expect(RectSemanticRegistry.isValid(RectSemantic.Bottom.Mid)).toBe(true);
  });

  it("should reject invalid semantic points", () => {
    expect(RectSemanticRegistry.isValid("bogus")).toBe(false);
  });

  it("should throw for unsupported coordinates lookup", () => {
    expect(() => RectSemanticRegistry.getCoordinates("bogus" as never)).toThrowError(
      "Unsupported semantic point: bogus",
    );
  });

  it("should throw for unsupported opposite lookup", () => {
    expect(() => RectSemanticRegistry.getOpposite("bogus" as never)).toThrowError(
      "Unsupported semantic point: bogus",
    );
  });
});
