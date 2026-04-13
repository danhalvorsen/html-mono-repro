import { describe, expect, it } from "vitest";
import { RectSemantic } from "../src/RectSemantic.js";
import { RectState } from "../src/RectState.js";
import { RectStateFixture } from "./fixtures/RectStateFixture.js";

describe("RectState", () => {
  const fixture = new RectStateFixture();

  it("should create a valid immutable state", () => {
    const state = fixture.createDefault();
    expect(state.centerX).toBe(0);
    expect(state.size.width).toBe(2);
    expect(Object.isFrozen(state)).toBe(true);
  });

  it("should move by delta", () => {
    const moved = fixture.createDefault().movedBy(3, -2, 1);
    expect(moved.centerX).toBe(3);
    expect(moved.centerY).toBe(-2);
    expect(moved.centerZ).toBe(1);
  });

  it("should move to absolute coordinates", () => {
    const moved = fixture.createDefault().movedTo(7, 8, 9);
    expect(moved.centerX).toBe(7);
    expect(moved.centerY).toBe(8);
    expect(moved.centerZ).toBe(9);
  });

  it("should rotate around a semantic point", () => {
    const rotated = fixture.createDefault().rotatedAround(RectSemantic.Top.Left, 45);
    expect(rotated.rotationDegrees).toBe(45);
    expect(rotated.pivot).toBe(RectSemantic.Top.Left);
  });

  it("should reject invalid size", () => {
    expect(() => new RectState(0, 0, 0, { width: 0, height: 1, depth: 1 })).toThrowError(
      "width must be > 0.",
    );
  });

  it("should reject invalid position", () => {
    expect(() => new RectState(Number.NaN, 0, 0, { width: 1, height: 1, depth: 1 })).toThrowError(
      "centerX must be finite.",
    );
  });

  it("should reject invalid pivot", () => {
    expect(() => new RectState(0, 0, 0, { width: 1, height: 1, depth: 1 }, 0, "nope" as never)).toThrowError(
      "pivot must be a valid semantic point.",
    );
  });

  it("should reject invalid delta", () => {
    expect(() => fixture.createDefault().movedBy(Number.NaN, 0, 0)).toThrowError(
      "deltaX must be finite.",
    );
  });
});
