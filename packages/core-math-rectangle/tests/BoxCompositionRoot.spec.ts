
// ============================================================================
// FILE: packages/core-math-box/tests/BoxCompositionRoot.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { Matrix4Gpu, Vector2Gpu, Vector3Gpu } from "@monorepo/core-math-gpu";
import {
  Aabb2,
  Aabb3,
  Box2,
  Box3,
  BoxCompositionRoot,
  Obb2,
  Obb3,
  SeparatingAxisBox2Collision,
  SeparatingAxisBox3Collision,
} from "../src/code.js";

describe("BoxCompositionRoot", () => {
  const sut = new BoxCompositionRoot();

  it("should create box2 objects", () => {
    const result = sut.createBox2(
      new Vector2Gpu(0, 0),
      new Vector2Gpu(2, 0),
      new Vector2Gpu(2, 1),
      new Vector2Gpu(0, 1),
    );

    expect(result).toBeInstanceOf(Box2);
  });

  it("should create aabb2 objects", () => {
    const result = sut.createAabb2(
      new Vector2Gpu(0, 0),
      new Vector2Gpu(2, 1),
    );

    expect(result).toBeInstanceOf(Aabb2);
  });

  it("should create obb2 objects", () => {
    const result = sut.createObb2(
      new Vector2Gpu(0, 0),
      new Vector2Gpu(1, 1),
      Math.PI * 0.25,
    );

    expect(result).toBeInstanceOf(Obb2);
  });

  it("should create box3 objects", () => {
    const result = sut.createBox3(
      new Vector3Gpu(0, 0, 0),
      new Vector3Gpu(1, 1, 1),
    );

    expect(result).toBeInstanceOf(Box3);
  });

  it("should create aabb3 objects", () => {
    const result = sut.createAabb3(
      new Vector3Gpu(-1, -1, -1),
      new Vector3Gpu(1, 1, 1),
    );

    expect(result).toBeInstanceOf(Aabb3);
  });

  it("should create obb3 objects", () => {
    const result = sut.createObb3(
      new Vector3Gpu(0, 0, 0),
      new Vector3Gpu(1, 1, 1),
      Matrix4Gpu.rotationY(Math.PI * 0.25),
    );

    expect(result).toBeInstanceOf(Obb3);
  });

  it("should create box2 collision services", () => {
    const result = sut.createBox2Collision();

    expect(result).toBeInstanceOf(SeparatingAxisBox2Collision);
  });

  it("should create box3 collision services", () => {
    const result = sut.createBox3Collision();

    expect(result).toBeInstanceOf(SeparatingAxisBox3Collision);
  });
});