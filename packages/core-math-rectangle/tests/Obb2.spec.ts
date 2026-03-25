
// ============================================================================
// FILE: packages/core-math-box/tests/Obb2.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { Vector2Gpu } from "@monorepo/core-math-gpu";
import { BoxFixture } from "./fixtures/BoxFixture.js";

describe("Obb2", () => {
  const fixture = new BoxFixture();

  it("should create a rotated box around center", () => {
    const sut = fixture.createObb2(10, 20, 2, 1, Math.PI * 0.5);

    expect(sut.center().equals(new Vector2Gpu(10, 20))).toBe(true);
    expect(sut.halfSize().equals(new Vector2Gpu(2, 1))).toBe(true);
    expect(sut.orientationRadians()).toBeCloseTo(Math.PI * 0.5);
  });

  it("should contain its center", () => {
    const sut = fixture.createObb2(10, 20, 2, 1, Math.PI * 0.25);

    expect(sut.contains(new Vector2Gpu(10, 20))).toBe(true);
  });

  it("should reject non-positive half size", () => {
    const act = () => fixture.createObb2(0, 0, 0, 1, 0);

    expect(act).toThrowError("Obb2 halfSize components must be greater than zero.");
  });
});
