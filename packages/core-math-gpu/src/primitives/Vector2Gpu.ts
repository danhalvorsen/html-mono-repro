// ============================================================================
// packages/math-core-gpu/src/primitives/Vector2Gpu.ts
// ============================================================================

import { Guard } from "../common/Guard.js";
import { EPSILON } from "../common/MathConstants.js";
 
import type { IVectorGpu } from "../contracts/IVectorGpu.js";

export class Vector2Gpu implements IVectorGpu<Vector2Gpu> {
  public static readonly Zero = new Vector2Gpu(0, 0);
  public static readonly UnitX = new Vector2Gpu(1, 0);
  public static readonly UnitY = new Vector2Gpu(0, 1);

  public constructor(
    public readonly x: number = 0,
    public readonly y: number = 0,
    public readonly z: number = 0,
  ) {
    Guard.finite(x, "x");
    Guard.finite(y, "y");
  }

  public static fromArray(
    values: ArrayLike<number>,
    offset: number = 0,
  ): Vector2Gpu {
    return new Vector2Gpu(values[offset] ?? 0, values[offset + 1] ?? 0);
  }

  public clone(): Vector2Gpu {
    return new Vector2Gpu(this.x, this.y);
  }

  public add(v: Vector2Gpu): Vector2Gpu {
    return new Vector2Gpu(this.x + v.x, this.y + v.y);
  }

  public subtract(v: Vector2Gpu): Vector2Gpu {
    return new Vector2Gpu(this.x - v.x, this.y - v.y);
  }

  public scale(scalar: number): Vector2Gpu {
    return new Vector2Gpu(this.x * scalar, this.y * scalar);
  }

  public multiplyScalar(scalar: number): Vector2Gpu {
    return this.scale(scalar);
  }

  public dot(v: Vector2Gpu): number {
    return this.x * v.x + this.y * v.y;
  }

  public cross(v: Vector2Gpu): Vector2Gpu {
    return new Vector2Gpu(0, 0, this.x * v.y - this.y * v.x);
  }

  public length(): number {
    return Math.hypot(this.x, this.y);
  }

  public normalize(): Vector2Gpu {
    const len = this.length();
    return len <= EPSILON ? this.clone() : this.scale(1 / len);
  }

  public transform(matrix: Float32Array | number[]): Vector2Gpu {
    if (matrix.length === 6) {
      const m0 = matrix[0]!;
      const m1 = matrix[1]!;
      const m2 = matrix[2]!;
      const m3 = matrix[3]!;
      const m4 = matrix[4]!;
      const m5 = matrix[5]!;

      return new Vector2Gpu(
        this.x * m0 + this.y * m2 + m4,
        this.x * m1 + this.y * m3 + m5,
      );
    }

    if (matrix.length === 9) {
      const m0 = matrix[0]!;
      const m1 = matrix[1]!;
      const m3 = matrix[3]!;
      const m4 = matrix[4]!;
      const m6 = matrix[6]!;
      const m7 = matrix[7]!;

      return new Vector2Gpu(
        this.x * m0 + this.y * m3 + m6,
        this.x * m1 + this.y * m4 + m7,
      );
    }

    throw new Error("Vector2Gpu.transform expects a 2x3 or 3x3 matrix.");
  }

  public angleTo(v: Vector2Gpu): number {
    const denominator = this.length() * v.length();
    if (denominator <= EPSILON) {
      return 0;
    }

    const cosine = this.dot(v) / denominator;
    return Math.acos(Math.max(-1, Math.min(1, cosine)));
  }

  public projectOnto(v: Vector2Gpu): Vector2Gpu {
    const denominator = v.dot(v);
    if (Math.abs(denominator) <= EPSILON) {
      return Vector2Gpu.Zero;
    }

    return v.scale(this.dot(v) / denominator);
  }

  public reflect(normal: Vector2Gpu): Vector2Gpu {
    const unit = normal.normalize();
    return this.subtract(unit.scale(2 * this.dot(unit)));
  }

  public lerp(v: Vector2Gpu, t: number): Vector2Gpu {
    return new Vector2Gpu(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
    );
  }

  public distanceTo(v: Vector2Gpu): number {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  public equals(v: Vector2Gpu, tolerance: number = EPSILON): boolean {
    return (
      Math.abs(this.x - v.x) <= tolerance &&
      Math.abs(this.y - v.y) <= tolerance
    );
  }

  public toArray(): number[] {
    return [this.x, this.y];
  }

  public toFloat32Array(): Float32Array {
    return new Float32Array([this.x, this.y]);
  }
}