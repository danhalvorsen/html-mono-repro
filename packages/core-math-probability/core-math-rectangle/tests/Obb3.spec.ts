// ============================================================================
// FILE: packages/core-math-box/tests/Obb3.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { Matrix4Gpu, Vector3Gpu } from "@monorepo/core-math-gpu";
import { BoxFixture } from "./fixtures/BoxFixture.js";

describe("Obb3", () => {
  const fixture = new BoxFixture();

  it("should create an oriented 3d box from a rotation matrix", () => {
    const rotation = fixture.createRotationY45();
    const sut = fixture.createObb3(
      new Vector3Gpu(10, 20, 30),
      new Vector3Gpu(1, 2, 3),
      rotation,
    );

    expect(sut.center().equals(new Vector3Gpu(10, 20, 30))).toBe(true);
    expect(sut.halfSize().equals(new Vector3Gpu(1, 2, 3))).toBe(true);
    expect(sut.orientation().equals(rotation)).toBe(true);
  });

  it("should contain its center", () => {
    const sut = fixture.createObb3(
      new Vector3Gpu(0, 0, 0),
      new Vector3Gpu(1, 1, 1),
      Matrix4Gpu.rotationZ(Math.PI * 0.25),
    );

    expect(sut.contains(new Vector3Gpu(0, 0, 0))).toBe(true);
  });
});
