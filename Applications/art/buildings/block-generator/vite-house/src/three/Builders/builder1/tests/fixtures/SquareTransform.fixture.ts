// ============================================================================
// FILE: Applications/art/buildings/block-generator/vite-house/tests/Builders/builder1/fixtures/SquareTransform.fixture.ts
// ============================================================================

import * as THREE from "three";
import { expect } from "vitest";

export class SquareTransformFixture {
  public createTranslation(x: number, y: number, z: number = 0): THREE.Matrix4 {
    return new THREE.Matrix4().makeTranslation(x, y, z);
  }

  public createRotationZ(radians: number): THREE.Matrix4 {
    return new THREE.Matrix4().makeRotationZ(radians);
  }

  public createLocalMatrix(
    x: number = 0,
    y: number = 0,
    rotationRadians: number = 0,
  ): THREE.Matrix4 {
    const translation = this.createTranslation(x, y, 0);
    const rotation = this.createRotationZ(rotationRadians);

    return new THREE.Matrix4().multiplyMatrices(translation, rotation);
  }

  public createWorldMatrix(
    parentWorld: THREE.Matrix4,
    localMatrix: THREE.Matrix4,
  ): THREE.Matrix4 {
    return new THREE.Matrix4().multiplyMatrices(parentWorld, localMatrix);
  }

  public transformPoint(
    matrix: THREE.Matrix4,
    x: number,
    y: number,
    z: number = 0,
  ): THREE.Vector3 {
    return new THREE.Vector3(x, y, z).applyMatrix4(matrix);
  }

  public expectPoint(
    actual: THREE.Vector3,
    x: number,
    y: number,
    z: number = 0,
  ): void {
    expect(actual.x).toBeCloseTo(x, 8);
    expect(actual.y).toBeCloseTo(y, 8);
    expect(actual.z).toBeCloseTo(z, 8);
  }
}