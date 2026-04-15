
// ============================================================================
// FILE: packages/core-math-box/tests/Box3Collision.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { Matrix4Gpu, Vector3Gpu } from "@monorepo/core-math-gpu";
import { BoxFixture } from "./fixtures/BoxFixture.js";

describe("SeparatingAxisBox3Collision", () => {
  const fixture = new BoxFixture();

  it("should detect intersection for overlapping axis-aligned boxes", () => {
    const collision = fixture.createBox3Collision();
    const left = fixture.createAxisAlignedBox3(
      new Vector3Gpu(0, 0, 0),
      new Vector3Gpu(1, 1, 1),
    );
    const right = fixture.createAxisAlignedBox3(
      new Vector3Gpu(1, 0, 0),
      new Vector3Gpu(1, 1, 1),
    );

    const result = collision.intersects(left, right);

    expect(result).toBe(true);
  });

  it("should not detect intersection for separated axis-aligned boxes", () => {
    const collision = fixture.createBox3Collision();
    const left = fixture.createAxisAlignedBox3(
      new Vector3Gpu(0, 0, 0),
      new Vector3Gpu(1, 1, 1),
    );
    const right = fixture.createAxisAlignedBox3(
      new Vector3Gpu(10, 0, 0),
      new Vector3Gpu(1, 1, 1),
    );

    const result = collision.intersects(left, right);

    expect(result).toBe(false);
  });

  it("should detect intersection between aabb3 and obb3", () => {
    const collision = fixture.createBox3Collision();
    const left = fixture.createAabb3(-2, -2, -2, 2, 2, 2);
    const right = fixture.createObb3(
      new Vector3Gpu(1, 0, 0),
      new Vector3Gpu(1, 1, 1),
      Matrix4Gpu.rotationY(Math.PI * 0.25),
    );

    const result = collision.intersects(left, right);

    expect(result).toBe(true);
  });

  it("should not detect intersection between distant aabb3 and obb3", () => {
    const collision = fixture.createBox3Collision();
    const left = fixture.createAabb3(-2, -2, -2, 2, 2, 2);
    const right = fixture.createObb3(
      new Vector3Gpu(20, 20, 20),
      new Vector3Gpu(1, 1, 1),
      Matrix4Gpu.rotationY(Math.PI * 0.25),
    );

    const result = collision.intersects(left, right);

    expect(result).toBe(false);
  });
});
