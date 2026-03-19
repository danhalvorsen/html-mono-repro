// packages/math-core-gpu/src/primitives/Matrix4Gpu.ts

import { EPSILON } from "../common/MathConstants.js";
import { IMatrixGpu } from "../contracts/IVectorGpu.js";

import { Vector3Gpu } from "./Vector3Gpu.js";

export class Matrix4Gpu implements IMatrixGpu {
  private readonly elements: Float32Array;

  public constructor(elements?: ArrayLike<number>) {
    this.elements = new Float32Array(16);

    if (elements !== undefined) {
      if (elements.length !== 16) {
        throw new Error("Matrix4Gpu requires 16 elements.");
      }

      this.elements.set(elements);
      return;
    }

    this.setIdentity();
  }

  public static identity(): Matrix4Gpu {
    return new Matrix4Gpu();
  }

  public static translation(x: number, y: number, z: number): Matrix4Gpu {
    return new Matrix4Gpu([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1,
    ]);
  }

  public static scaling(x: number, y: number, z: number): Matrix4Gpu {
    return new Matrix4Gpu([
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1,
    ]);
  }

  public static rotationX(radians: number): Matrix4Gpu {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return new Matrix4Gpu([
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ]);
  }

  public static rotationY(radians: number): Matrix4Gpu {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return new Matrix4Gpu([
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ]);
  }

  public static rotationZ(radians: number): Matrix4Gpu {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return new Matrix4Gpu([
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }

  public static trs(
    translation: Vector3Gpu,
    rotationEulerRadians: Vector3Gpu,
    scale: Vector3Gpu,
  ): Matrix4Gpu {
    return Matrix4Gpu.translation(translation.x, translation.y, translation.z)
      .multiply(Matrix4Gpu.rotationZ(rotationEulerRadians.z))
      .multiply(Matrix4Gpu.rotationY(rotationEulerRadians.y))
      .multiply(Matrix4Gpu.rotationX(rotationEulerRadians.x))
      .multiply(Matrix4Gpu.scaling(scale.x, scale.y, scale.z)) as Matrix4Gpu;
  }

  public clone(): Matrix4Gpu {
    return new Matrix4Gpu(this.elements);
  }

  public multiply(mat: IMatrixGpu): IMatrixGpu {
    const a = this.elements;
    const b = mat.toFloat32Array();
    const result = new Float32Array(16);

    const a00 = a[0]!;
    const a01 = a[4]!;
    const a02 = a[8]!;
    const a03 = a[12]!;
    const a10 = a[1]!;
    const a11 = a[5]!;
    const a12 = a[9]!;
    const a13 = a[13]!;
    const a20 = a[2]!;
    const a21 = a[6]!;
    const a22 = a[10]!;
    const a23 = a[14]!;
    const a30 = a[3]!;
    const a31 = a[7]!;
    const a32 = a[11]!;
    const a33 = a[15]!;

    const b00 = b[0]!;
    const b01 = b[4]!;
    const b02 = b[8]!;
    const b03 = b[12]!;
    const b10 = b[1]!;
    const b11 = b[5]!;
    const b12 = b[9]!;
    const b13 = b[13]!;
    const b20 = b[2]!;
    const b21 = b[6]!;
    const b22 = b[10]!;
    const b23 = b[14]!;
    const b30 = b[3]!;
    const b31 = b[7]!;
    const b32 = b[11]!;
    const b33 = b[15]!;

    result[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    result[1] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    result[2] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    result[3] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;

    result[4] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    result[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    result[6] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    result[7] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;

    result[8] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    result[9] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    result[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    result[11] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;

    result[12] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
    result[13] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
    result[14] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
    result[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

    return new Matrix4Gpu(result);
  }

  public setIdentity(): void {
    this.elements.fill(0);
    this.elements[0] = 1;
    this.elements[5] = 1;
    this.elements[10] = 1;
    this.elements[15] = 1;
  }

  public transpose(): IMatrixGpu {
    const e = this.elements;

    return new Matrix4Gpu([
      e[0]!, e[4]!, e[8]!, e[12]!,
      e[1]!, e[5]!, e[9]!, e[13]!,
      e[2]!, e[6]!, e[10]!, e[14]!,
      e[3]!, e[7]!, e[11]!, e[15]!,
    ]);
  }

  public determinant(): number {
    const m = this.elements;

    const m00 = m[0]!;
    const m01 = m[4]!;
    const m02 = m[8]!;
    const m03 = m[12]!;
    const m10 = m[1]!;
    const m11 = m[5]!;
    const m12 = m[9]!;
    const m13 = m[13]!;
    const m20 = m[2]!;
    const m21 = m[6]!;
    const m22 = m[10]!;
    const m23 = m[14]!;
    const m30 = m[3]!;
    const m31 = m[7]!;
    const m32 = m[11]!;
    const m33 = m[15]!;

    return (
      m03 * m12 * m21 * m30 - m02 * m13 * m21 * m30 -
      m03 * m11 * m22 * m30 + m01 * m13 * m22 * m30 +
      m02 * m11 * m23 * m30 - m01 * m12 * m23 * m30 -
      m03 * m12 * m20 * m31 + m02 * m13 * m20 * m31 +
      m03 * m10 * m22 * m31 - m00 * m13 * m22 * m31 -
      m02 * m10 * m23 * m31 + m00 * m12 * m23 * m31 +
      m03 * m11 * m20 * m32 - m01 * m13 * m20 * m32 -
      m03 * m10 * m21 * m32 + m00 * m13 * m21 * m32 +
      m01 * m10 * m23 * m32 - m00 * m11 * m23 * m32 -
      m02 * m11 * m20 * m33 + m01 * m12 * m20 * m33 +
      m02 * m10 * m21 * m33 - m00 * m12 * m21 * m33 -
      m01 * m10 * m22 * m33 + m00 * m11 * m22 * m33
    );
  }

  public inverse(): IMatrixGpu | null {
    const m = this.elements;
    const inv = new Float32Array(16);

    const m0 = m[0]!;
    const m1 = m[1]!;
    const m2 = m[2]!;
    const m3 = m[3]!;
    const m4 = m[4]!;
    const m5 = m[5]!;
    const m6 = m[6]!;
    const m7 = m[7]!;
    const m8 = m[8]!;
    const m9 = m[9]!;
    const m10 = m[10]!;
    const m11 = m[11]!;
    const m12 = m[12]!;
    const m13 = m[13]!;
    const m14 = m[14]!;
    const m15 = m[15]!;

    inv[0] = m5 * m10 * m15 - m5 * m11 * m14 - m9 * m6 * m15 + m9 * m7 * m14 + m13 * m6 * m11 - m13 * m7 * m10;
    inv[4] = -m4 * m10 * m15 + m4 * m11 * m14 + m8 * m6 * m15 - m8 * m7 * m14 - m12 * m6 * m11 + m12 * m7 * m10;
    inv[8] = m4 * m9 * m15 - m4 * m11 * m13 - m8 * m5 * m15 + m8 * m7 * m13 + m12 * m5 * m11 - m12 * m7 * m9;
    inv[12] = -m4 * m9 * m14 + m4 * m10 * m13 + m8 * m5 * m14 - m8 * m6 * m13 - m12 * m5 * m10 + m12 * m6 * m9;

    inv[1] = -m1 * m10 * m15 + m1 * m11 * m14 + m9 * m2 * m15 - m9 * m3 * m14 - m13 * m2 * m11 + m13 * m3 * m10;
    inv[5] = m0 * m10 * m15 - m0 * m11 * m14 - m8 * m2 * m15 + m8 * m3 * m14 + m12 * m2 * m11 - m12 * m3 * m10;
    inv[9] = -m0 * m9 * m15 + m0 * m11 * m13 + m8 * m1 * m15 - m8 * m3 * m13 - m12 * m1 * m11 + m12 * m3 * m9;
    inv[13] = m0 * m9 * m14 - m0 * m10 * m13 - m8 * m1 * m14 + m8 * m2 * m13 + m12 * m1 * m10 - m12 * m2 * m9;

    inv[2] = m1 * m6 * m15 - m1 * m7 * m14 - m5 * m2 * m15 + m5 * m3 * m14 + m13 * m2 * m7 - m13 * m3 * m6;
    inv[6] = -m0 * m6 * m15 + m0 * m7 * m14 + m4 * m2 * m15 - m4 * m3 * m14 - m12 * m2 * m7 + m12 * m3 * m6;
    inv[10] = m0 * m5 * m15 - m0 * m7 * m13 - m4 * m1 * m15 + m4 * m3 * m13 + m12 * m1 * m7 - m12 * m3 * m5;
    inv[14] = -m0 * m5 * m14 + m0 * m6 * m13 + m4 * m1 * m14 - m4 * m2 * m13 - m12 * m1 * m6 + m12 * m2 * m5;

    inv[3] = -m1 * m6 * m11 + m1 * m7 * m10 + m5 * m2 * m11 - m5 * m3 * m10 - m9 * m2 * m7 + m9 * m3 * m6;
    inv[7] = m0 * m6 * m11 - m0 * m7 * m10 - m4 * m2 * m11 + m4 * m3 * m10 + m8 * m2 * m7 - m8 * m3 * m6;
    inv[11] = -m0 * m5 * m11 + m0 * m7 * m9 + m4 * m1 * m11 - m4 * m3 * m9 - m8 * m1 * m7 + m8 * m3 * m5;
    inv[15] = m0 * m5 * m10 - m0 * m6 * m9 - m4 * m1 * m10 + m4 * m2 * m9 + m8 * m1 * m6 - m8 * m2 * m5;

    const determinant = m0 * inv[0]! + m4 * inv[1]! + m8 * inv[2]! + m12 * inv[3]!;

    if (Math.abs(determinant) <= EPSILON) {
      return null;
    }

    const scale = 1 / determinant;

    for (let i = 0; i < 16; i++) {
      inv[i]! *= scale;
    }

    return new Matrix4Gpu(inv);
  }

  public add(mat: IMatrixGpu): IMatrixGpu {
    const b = mat.toFloat32Array();
    const r = new Float32Array(16);

    for (let i = 0; i < 16; i++) {
      r[i] = this.elements[i]! + b[i]!;
    }

    return new Matrix4Gpu(r);
  }

  public subtract(mat: IMatrixGpu): IMatrixGpu {
    const b = mat.toFloat32Array();
    const r = new Float32Array(16);

    for (let i = 0; i < 16; i++) {
      r[i] = this.elements[i]! - b[i]!;
    }

    return new Matrix4Gpu(r);
  }

  public scale(scalar: number): IMatrixGpu {
    const r = new Float32Array(16);

    for (let i = 0; i < 16; i++) {
      r[i] = this.elements[i]! * scalar;
    }

    return new Matrix4Gpu(r);
  }

  public applyToVector(vec: number[]): number[] {
    if (vec.length < 3) {
      throw new Error("Vector must have at least 3 components.");
    }

    const v = new Vector3Gpu(vec[0]!, vec[1]!, vec[2]!).transform(this.elements);
    return [v.x, v.y, v.z];
  }

  public toFloat32Array(): Float32Array {
    return this.elements.slice();
  }

  public equals(mat: IMatrixGpu, epsilon: number = EPSILON): boolean {
    const b = mat.toFloat32Array();

    for (let i = 0; i < 16; i++) {
      if (Math.abs(this.elements[i]! - b[i]!) > epsilon) {
        return false;
      }
    }

    return true;
  }

  public setFrom(mat: IMatrixGpu): IMatrixGpu {
    return new Matrix4Gpu(mat.toFloat32Array());
  }
}