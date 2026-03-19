// ============================================================================
// packages/math-core-gpu/tests/fixtures/Matrix4GpuTestFixture.ts
// ============================================================================

import { expect } from "vitest";
import { Matrix4Gpu, Vector3Gpu } from "../src/index.js";

export class Matrix4GpuTestFixture {
  public createIdentity(): Matrix4Gpu {
    return Matrix4Gpu.identity();
  }

  public createTranslation(x: number, y: number, z: number): Matrix4Gpu {
    return Matrix4Gpu.translation(x, y, z);
  }

  public createScaling(x: number, y: number, z: number): Matrix4Gpu {
    return Matrix4Gpu.scaling(x, y, z);
  }

  public createRotationX(radians: number): Matrix4Gpu {
    return Matrix4Gpu.rotationX(radians);
  }

  public createRotationY(radians: number): Matrix4Gpu {
    return Matrix4Gpu.rotationY(radians);
  }

  public createRotationZ(radians: number): Matrix4Gpu {
    return Matrix4Gpu.rotationZ(radians);
  }

  public createVector(x: number, y: number, z: number): Vector3Gpu {
    return new Vector3Gpu(x, y, z);
  }

  public expectMatrixElements(
    matrix: Matrix4Gpu,
    expected: readonly number[],
    epsilon: number = 1e-6,
  ): void {
    const actual = Array.from(matrix.toFloat32Array());

    expect(actual).toHaveLength(expected.length);

    for (let i = 0; i < expected.length; i++) {
      expect(actual[i]).toBeCloseTo(expected[i]!, this.toPrecision(epsilon));
    }
  }

  public expectVector(
    actual: Vector3Gpu,
    expected: Vector3Gpu,
    epsilon: number = 1e-6,
  ): void {
    expect(actual.x).toBeCloseTo(expected.x, this.toPrecision(epsilon));
    expect(actual.y).toBeCloseTo(expected.y, this.toPrecision(epsilon));
    expect(actual.z).toBeCloseTo(expected.z, this.toPrecision(epsilon));
  }

  private toPrecision(epsilon: number): number {
    if (epsilon <= 0) {
      return 6;
    }

    return Math.max(0, Math.ceil(Math.abs(Math.log10(epsilon))));
  }
}