// ==========================================
// Vector2d / Vector3d – New Math Core
// ==========================================

// ---------- Interfaces ----------

export interface IVector2d {
  readonly dimension: 2;

  x: number;
  y: number;

  clone(): IVector2d;

  add(v: IVector2d): IVector2d;
  subtract(v: IVector2d): IVector2d;
  scale(s: number): IVector2d;

  dot(v: IVector2d): number;
  cross(v: IVector2d): number; // scalar (2D)

  length(): number;
  normalize(): IVector2d;

  distanceTo(v: IVector2d): number;
  equals(v: IVector2d, eps?: number): boolean;

  toArray(): Float32Array;
}

export interface IVector3d {
  readonly dimension: 3;

  x: number;
  y: number;
  z: number;

  clone(): IVector3d;

  add(v: IVector3d): IVector3d;
  subtract(v: IVector3d): IVector3d;
  scale(s: number): IVector3d;

  dot(v: IVector3d): number;
  cross(v: IVector3d): IVector3d;

  length(): number;
  normalize(): IVector3d;

  distanceTo(v: IVector3d): number;
  equals(v: IVector3d, eps?: number): boolean;

  toArray(): Float32Array;
}

// ---------- CPU Implementations ----------

export class Vector2d implements IVector2d {
  readonly dimension = 2 as const;

  constructor(public x = 0, public y = 0) {}

  clone(): Vector2d {
    return new Vector2d(this.x, this.y);
  }

  add(v: IVector2d): Vector2d {
    return new Vector2d(this.x + v.x, this.y + v.y);
  }

  subtract(v: IVector2d): Vector2d {
    return new Vector2d(this.x - v.x, this.y - v.y);
  }

  scale(s: number): Vector2d {
    return new Vector2d(this.x * s, this.y * s);
  }

  dot(v: IVector2d): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: IVector2d): number {
    return this.x * v.y - this.y * v.x;
  }

  length(): number {
    return Math.hypot(this.x, this.y);
  }

  normalize(): Vector2d {
    const len = this.length();
    return len > 0 ? this.scale(1 / len) : this.clone();
  }

  distanceTo(v: IVector2d): number {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  equals(v: IVector2d, eps = 1e-6): boolean {
    return (
      Math.abs(this.x - v.x) <= eps &&
      Math.abs(this.y - v.y) <= eps
    );
  }

  toArray(): Float32Array {
    return new Float32Array([this.x, this.y]);
  }
}

export class Vector3d implements IVector3d {
  readonly dimension = 3 as const;

  constructor(public x = 0, public y = 0, public z = 0) {}

  clone(): Vector3d {
    return new Vector3d(this.x, this.y, this.z);
  }

  add(v: IVector3d): Vector3d {
    return new Vector3d(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  subtract(v: IVector3d): Vector3d {
    return new Vector3d(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  scale(s: number): Vector3d {
    return new Vector3d(this.x * s, this.y * s, this.z * s);
  }

  dot(v: IVector3d): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: IVector3d): Vector3d {
    return new Vector3d(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  length(): number {
    return Math.hypot(this.x, this.y, this.z);
  }

  normalize(): Vector3d {
    const len = this.length();
    return len > 0 ? this.scale(1 / len) : this.clone();
  }

  distanceTo(v: IVector3d): number {
    return Math.hypot(
      this.x - v.x,
      this.y - v.y,
      this.z - v.z
    );
  }

  equals(v: IVector3d, eps = 1e-6): boolean {
    return (
      Math.abs(this.x - v.x) <= eps &&
      Math.abs(this.y - v.y) <= eps &&
      Math.abs(this.z - v.z) <= eps
    );
  }

  toArray(): Float32Array {
    return new Float32Array([this.x, this.y, this.z]);
  }
}
