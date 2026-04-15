
// ============================================================================
// FILE: packages/core-math-box/tests/Aabb2.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { Vector2Gpu } from "@monorepo/core-math-gpu";
import { BoxFixture } from "./fixtures/BoxFixture.js";

describe("Aabb2", () => {
  const fixture = new BoxFixture();

  it("should expose min and max", () => {
    const sut = fixture.createAabb2(1, 2, 5, 7);

    expect(sut.min().equals(new Vector2Gpu(1, 2))).toBe(true);
    expect(sut.max().equals(new Vector2Gpu(5, 7))).toBe(true);
  });

  it("should calculate box metrics", () => {
    const sut = fixture.createAabb2(1, 2, 5, 7);

    expect(sut.width()).toBeCloseTo(4);
    expect(sut.height()).toBeCloseTo(5);
    expect(sut.area()).toBeCloseTo(20);
    expect(sut.perimeter()).toBeCloseTo(18);
    expect(sut.center().equals(new Vector2Gpu(3, 4.5))).toBe(true);
  });

  it("should reject invalid bounds", () => {
    const act = () => fixture.createAabb2(5, 2, 1, 7);

    expect(act).toThrowError("Aabb2 max must be greater than or equal to min.");
  });

  it("should reject zero sized bounds", () => {
    const act = () => fixture.createAabb2(1, 2, 1, 7);

    expect(act).toThrowError("Aabb2 dimensions must be greater than zero.");
  });
});
