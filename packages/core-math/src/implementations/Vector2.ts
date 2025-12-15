import { IVector } from '../interfaces/IVector.js';

export class Vector2 implements IVector<Vector2> {
  constructor(
    public x: number,
    public y: number,
    public z: number = 0
  ) {}

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  scale(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector2): Vector2 {
    // In 2D, the "cross product" returns a pseudo-vector on Z only (scalar form)
    const z = this.x * v.y - this.y * v.x;
    return new Vector2(0, 0, z);
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize(): Vector2 {
    const len = this.length();
    return len === 0 ? this.clone() : this.scale(1 / len);
  }

  transform(matrix: Float32Array | number[]): Vector2 {
    const m = matrix;
    const x = this.x,
      y = this.y;
    return new Vector2(x * m[0] + y * m[2] + m[4], x * m[1] + y * m[3] + m[5]);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  angleTo(v: Vector2): number {
    const dot = this.dot(v);
    const lengths = this.length() * v.length();
    return lengths === 0 ? 0 : Math.acos(dot / lengths);
  }

  projectOnto(v: Vector2): Vector2 {
    const scalar = this.dot(v) / v.dot(v);
    return v.scale(scalar);
  }

  reflect(normal: Vector2): Vector2 {
    const dot2 = 2 * this.dot(normal);
    return this.subtract(normal.scale(dot2));
  }

  lerp(v: Vector2, t: number): Vector2 {
    return new Vector2(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t
    );
  }

  distanceTo(v: Vector2): number {
    return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
  }

  equals(v: Vector2, tolerance: number = 1e-6): boolean {
    return (
      Math.abs(this.x - v.x) < tolerance && Math.abs(this.y - v.y) < tolerance
    );
  }

  toArray(): number[] {
    return [this.x, this.y];
  }

    multiplyScalar(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);         
  }
}
