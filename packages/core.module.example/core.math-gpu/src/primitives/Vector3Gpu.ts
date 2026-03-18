// packages/math-core-gpu/src/primitives/Vector3Gpu.ts

import { EPSILON } from "../common/MathConstants.js";
import { Guard } from "../common/Guard.js";
import type { IVector } from "../interfaces/IVector.js";

export class Vector3Gpu implements IVector<Vector3Gpu> {
  public static readonly Zero = new Vector3Gpu(0, 0, 0);
  public static readonly UnitX = new Vector3Gpu(1, 0, 0);
  public static readonly UnitY = new Vector3Gpu(0, 1, 0);
  public static readonly UnitZ = new Vector3Gpu(0, 0, 1);

  public constructor(
    public readonly x: number = 0,
    public readonly y: number = 0,
    public readonly z: number = 0,
  ) {
    Guard.finite(x, "x");
    Guard.finite(y, "y");
    Guard.finite(z, "z");
  }

  public static fromArray(values: ArrayLike<number>, offset: number = 0): Vector3Gpu {
    return new Vector3Gpu(
      values[offset] ?? 0,
      values[offset + 1] ?? 0,
      values[offset + 2] ?? 0,
    );
  }

  public clone(): Vector3Gpu {
    return new Vector3Gpu(this.x, this.y, this.z);
  }

  public add(v: Vector3Gpu): Vector3Gpu {
    return new Vector3Gpu(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  public subtract(v: Vector3Gpu): Vector3Gpu {
    return new Vector3Gpu(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  public scale(scalar: number): Vector3Gpu {
    return new Vector3Gpu(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  public multiplyScalar(scalar: number): Vector3Gpu {
    return this.scale(scalar);
  }

  public dot(v: Vector3Gpu): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public cross(v: Vector3Gpu): Vector3Gpu {
    return new Vector3Gpu(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x,
    );
  }

  public length(): number {
    return Math.hypot(this.x, this.y, this.z);
  }

  public normalize(): Vector3Gpu {
    const len = this.length();
    return len <= EPSILON ? this.clone() : this.scale(1 / len);
  }

  public transform(matrix: Float32Array | number[]): Vector3Gpu {
    if (matrix.length !== 16) {
      throw new Error("Vector3Gpu.transform expects a 4x4 matrix.");
    }

    const m0 = matrix[0]!;
    const m1 = matrix[1]!;
    const m2 = matrix[2]!;
    const m3 = matrix[3]!;
    const m4 = matrix[4]!;
    const m5 = matrix[5]!;
    const m6 = matrix[6]!;
    const m7 = matrix[7]!;
    const m8 = matrix[8]!;
    const m9 = matrix[9]!;
    const m10 = matrix[10]!;
    const m11 = matrix[11]!;
    const m12 = matrix[12]!;
    const m13 = matrix[13]!;
    const m14 = matrix[14]!;
    const m15 = matrix[15]!;

    const x = this.x * m0 + this.y * m4 + this.z * m8 + m12;
    const y = this.x * m1 + this.y * m5 + this.z * m9 + m13;
    const z = this.x * m2 + this.y * m6 + this.z * m10 + m14;
    const w = this.x * m3 + this.y * m7 + this.z * m11 + m15;

    if (Math.abs(w) > EPSILON && Math.abs(w - 1) > EPSILON) {
      return new Vector3Gpu(x / w, y / w, z / w);
    }

    return new Vector3Gpu(x, y, z);
  }

  public angleTo(v: Vector3Gpu): number {
    const denominator = this.length() * v.length();
    if (denominator <= EPSILON) {
      return 0;
    }

    const cosine = this.dot(v) / denominator;
    return Math.acos(Math.max(-1, Math.min(1, cosine)));
  }

  public projectOnto(v: Vector3Gpu): Vector3Gpu {
    const denominator = v.dot(v);
    if (Math.abs(denominator) <= EPSILON) {
      return Vector3Gpu.Zero;
    }

    return v.scale(this.dot(v) / denominator);
  }

  public reflect(normal: Vector3Gpu): Vector3Gpu {
    const unit = normal.normalize();
    return this.subtract(unit.scale(2 * this.dot(unit)));
  }

  public lerp(v: Vector3Gpu, t: number): Vector3Gpu {
    return new Vector3Gpu(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
      this.z + (v.z - this.z) * t,
    );
  }

  public distanceTo(v: Vector3Gpu): number {
    return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  public equals(v: Vector3Gpu, tolerance: number = EPSILON): boolean {
    return (
      Math.abs(this.x - v.x) <= tolerance &&
      Math.abs(this.y - v.y) <= tolerance &&
      Math.abs(this.z - v.z) <= tolerance
    );
  }

  public toArray(): number[] {
    return [this.x, this.y, this.z];
  }

  public toFloat32Array(): Float32Array {
    return new Float32Array([this.x, this.y, this.z]);
  }
}