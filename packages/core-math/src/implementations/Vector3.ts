import { IVector } from "../interfaces/IVector.js";

export class Vector3 implements IVector<Vector3> {
  constructor(
    public x: number,
    public y: number,
    public z: number
  ) {}

  add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Returns a new Vector3 that is the result of subtracting the given vector
   * from this vector.
   * @param v The vector to subtract.
   * @returns A new Vector3 that is the result of the subtraction.
   */
  /*******  8aa1f985-38e4-4051-b146-3a758a210ce0  *******/ subtract(
    v: Vector3
  ): Vector3 {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  scale(scalar: number): Vector3 {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector3): Vector3 {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  normalize(): Vector3 {
    const len = this.length();
    return len === 0 ? this.clone() : this.scale(1 / len);
  }

  transform(matrix: Float32Array | number[]): Vector3 {
    const m = matrix;
    const x = this.x,
      y = this.y,
      z = this.z;
    return new Vector3(
      x * m[0] + y * m[4] + z * m[8] + m[12],
      x * m[1] + y * m[5] + z * m[9] + m[13],
      x * m[2] + y * m[6] + z * m[10] + m[14]
    );
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  angleTo(v: Vector3): number {
    const dot = this.dot(v);
    const lengths = this.length() * v.length();
    return lengths === 0 ? 0 : Math.acos(dot / lengths);
  }

  projectOnto(v: Vector3): Vector3 {
    const scalar = this.dot(v) / v.dot(v);
    return v.scale(scalar);
  }

  reflect(normal: Vector3): Vector3 {
    const dot2 = 2 * this.dot(normal);
    return this.subtract(normal.scale(dot2));
  }

  lerp(v: Vector3, t: number): Vector3 {
    return new Vector3(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
      this.z + (v.z - this.z) * t
    );
  }

  distanceTo(v: Vector3): number {
    return Math.sqrt(
      (this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2
    );
  }

  equals(v: Vector3, tolerance: number = 1e-6): boolean {
    return (
      Math.abs(this.x - v.x) < tolerance &&
      Math.abs(this.y - v.y) < tolerance &&
      Math.abs(this.z - v.z) < tolerance
    );
  }

  toArray(): number[] {
    return [this.x, this.y, this.z];
  }

  multiplyScalar(scalar: number): Vector3 {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);                
  }
}
