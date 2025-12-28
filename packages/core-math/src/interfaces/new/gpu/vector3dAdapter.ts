// src/interfaces/new/gpu/Vector3dAdapter.ts

import { IVector } from "../../IVector.js";
import { Vector3d } from "./vector.js";

export class Vector3dAdapter implements IVector<Vector3dAdapter> {
  private readonly core: Vector3d;

  constructor(core?: Vector3d) {
    this.core = core ? core.clone() : new Vector3d();
  }

  get x(): number { return this.core.x; }
  get y(): number { return this.core.y; }
  get z(): number { return this.core.z; }

  add(v: Vector3dAdapter): Vector3dAdapter {
    return new Vector3dAdapter(this.core.clone().add(v.core));
  }

  subtract(v: Vector3dAdapter): Vector3dAdapter {
    return new Vector3dAdapter(this.core.clone().sub(v.core));
  }

  scale(s: number): Vector3dAdapter {
    const r = this.core.clone();
    r.x *= s;
    r.y *= s;
    r.z *= s;
    return new Vector3dAdapter(r);
  }

  dot(v: Vector3dAdapter): number {
    return this.core.dot(v.core);
  }

  cross(v: Vector3dAdapter): Vector3dAdapter {
    return new Vector3dAdapter(this.core.clone().cross(v.core));
  }

  length(): number {
    return this.core.length();
  }

  normalize(): Vector3dAdapter {
    return new Vector3dAdapter(this.core.clone().normalize());
  }

  distanceTo(v: Vector3dAdapter): number {
    return this.core.clone().sub(v.core).length();
  }

  angleTo(v: Vector3dAdapter): number {
    return Math.acos(
      this.core.dot(v.core) / (this.core.length() * v.core.length())
    );
  }

  projectOnto(v: Vector3dAdapter): Vector3dAdapter {
    const s = this.core.dot(v.core) / v.core.dot(v.core);
    const r = v.core.clone();
    r.x *= s;
    r.y *= s;
    r.z *= s;
    return new Vector3dAdapter(r);
  }

  reflect(normal: Vector3dAdapter): Vector3dAdapter {
    const d = this.core.dot(normal.core);
    const n = normal.core.clone();
    n.x *= 2 * d;
    n.y *= 2 * d;
    n.z *= 2 * d;
    return new Vector3dAdapter(this.core.clone().sub(n));
  }

  lerp(v: Vector3dAdapter, t: number): Vector3dAdapter {
    const r = v.core.clone().sub(this.core);
    r.x *= t;
    r.y *= t;
    r.z *= t;
    return new Vector3dAdapter(this.core.clone().add(r));
  }

  equals(v: Vector3dAdapter, eps = 1e-6): boolean {
    return (
      Math.abs(this.core.x - v.core.x) <= eps &&
      Math.abs(this.core.y - v.core.y) <= eps &&
      Math.abs(this.core.z - v.core.z) <= eps
    );
  }

  clone(): Vector3dAdapter {
    return new Vector3dAdapter(this.core.clone());
  }

  toArray(): number[] {
    return [this.core.x, this.core.y, this.core.z];
  }

  transform(): Vector3dAdapter {
    throw new Error("Vector transform via matrix not supported in adapter");
  }
}
