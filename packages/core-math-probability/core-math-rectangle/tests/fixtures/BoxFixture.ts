// ============================================================================
// FILE: packages/core-math-box/tests/fixtures/BoxFixture.ts
// ============================================================================

import { Matrix4Gpu, Vector2Gpu, Vector3Gpu } from "@monorepo/core-math-gpu";
import {
  Aabb2,
  Aabb3,
  Box2,
  Box3,
  BoxCompositionRoot,
  IBox2Collision,
  IBox3Collision,
  Obb2,
  Obb3,
} from "../../src/code.js";

export class BoxFixture {
  private readonly compositionRoot: BoxCompositionRoot;

  public constructor() {
    this.compositionRoot = new BoxCompositionRoot();
  }

  public createBox2Collision(): IBox2Collision {
    return this.compositionRoot.createBox2Collision();
  }

  public createBox3Collision(): IBox3Collision {
    return this.compositionRoot.createBox3Collision();
  }

  public createUnitBox2AtOrigin(): Box2 {
    return this.compositionRoot.createBox2(
      new Vector2Gpu(0, 0),
      new Vector2Gpu(2, 0),
      new Vector2Gpu(2, 1),
      new Vector2Gpu(0, 1),
    );
  }

  public createShiftedBox2(offsetX: number, offsetY: number): Box2 {
    return this.compositionRoot.createBox2(
      new Vector2Gpu(offsetX + 0, offsetY + 0),
      new Vector2Gpu(offsetX + 2, offsetY + 0),
      new Vector2Gpu(offsetX + 2, offsetY + 1),
      new Vector2Gpu(offsetX + 0, offsetY + 1),
    );
  }

  public createAabb2(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): Aabb2 {
    return this.compositionRoot.createAabb2(
      new Vector2Gpu(minX, minY),
      new Vector2Gpu(maxX, maxY),
    );
  }

  public createObb2(
    centerX: number,
    centerY: number,
    halfWidth: number,
    halfHeight: number,
    rotationRadians: number,
  ): Obb2 {
    return this.compositionRoot.createObb2(
      new Vector2Gpu(centerX, centerY),
      new Vector2Gpu(halfWidth, halfHeight),
      rotationRadians,
    );
  }

  public createAxisAlignedBox3(
    center: Vector3Gpu = new Vector3Gpu(0, 0, 0),
    halfSize: Vector3Gpu = new Vector3Gpu(1, 2, 3),
  ): Box3 {
    return this.compositionRoot.createBox3(
      center,
      halfSize,
      Vector3Gpu.UnitX,
      Vector3Gpu.UnitY,
      Vector3Gpu.UnitZ,
    );
  }

  public createAabb3(
    minX: number,
    minY: number,
    minZ: number,
    maxX: number,
    maxY: number,
    maxZ: number,
  ): Aabb3 {
    return this.compositionRoot.createAabb3(
      new Vector3Gpu(minX, minY, minZ),
      new Vector3Gpu(maxX, maxY, maxZ),
    );
  }

  public createObb3(
    center: Vector3Gpu,
    halfSize: Vector3Gpu,
    orientation: Matrix4Gpu,
  ): Obb3 {
    return this.compositionRoot.createObb3(center, halfSize, orientation);
  }

  public createRotationZ90(): Matrix4Gpu {
    return Matrix4Gpu.rotationZ(Math.PI * 0.5);
  }

  public createRotationY45(): Matrix4Gpu {
    return Matrix4Gpu.rotationY(Math.PI * 0.25);
  }
}
