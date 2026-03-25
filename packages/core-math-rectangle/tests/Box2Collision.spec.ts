
// ============================================================================
// FILE: packages/core-math-box/tests/Box2Collision.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { BoxFixture } from "./fixtures/BoxFixture.js";

describe("SeparatingAxisBox2Collision", () => {
  const fixture = new BoxFixture();

  it("should detect intersection for overlapping box2 instances", () => {
    const collision = fixture.createBox2Collision();
    const left = fixture.createUnitBox2AtOrigin();
    const right = fixture.createShiftedBox2(1, 0.25);

    const result = collision.intersects(left, right);

    expect(result).toBe(true);
  });

  it("should not detect intersection for separated box2 instances", () => {
    const collision = fixture.createBox2Collision();
    const left = fixture.createUnitBox2AtOrigin();
    const right = fixture.createShiftedBox2(5, 0);

    const result = collision.intersects(left, right);

    expect(result).toBe(false);
  });

  it("should detect intersection between aabb2 and obb2", () => {
    const collision = fixture.createBox2Collision();
    const left = fixture.createAabb2(0, 0, 4, 2);
    const right = fixture.createObb2(3, 1, 1, 0.5, Math.PI * 0.25);

    const result = collision.intersects(left, right);

    expect(result).toBe(true);
  });

  it("should not detect intersection between distant aabb2 and obb2", () => {
    const collision = fixture.createBox2Collision();
    const left = fixture.createAabb2(0, 0, 2, 2);
    const right = fixture.createObb2(10, 10, 1, 1, Math.PI * 0.25);

    const result = collision.intersects(left, right);

    expect(result).toBe(false);
  });
});
