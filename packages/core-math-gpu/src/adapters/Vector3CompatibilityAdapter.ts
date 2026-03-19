// packages/math-core-gpu/src/adapters/Vector3CompatibilityAdapter.ts

import type { IVector } from  "../interfaces/IVector.js";
import { Vector3Gpu } from "../primitives/Vector3Gpu.js";

export class Vector3CompatibilityAdapter
  implements IVector<Vector3CompatibilityAdapter>
{
  private readonly value: Vector3Gpu;

  public constructor(value?: Vector3Gpu) {
    this.value = value?.clone() ?? Vector3Gpu.Zero;
  }

  public get x(): number {
    return this.value.x;
  }

  public get y(): number {
    return this.value.y;
  }

  public get z(): number {
    return this.value.z;
  }

  public add(v: Vector3CompatibilityAdapter): Vector3CompatibilityAdapter {
    return new Vector3CompatibilityAdapter(this.value.add(v.value));
  }

  public subtract(v: Vector3CompatibilityAdapter): Vector3CompatibilityAdapter {
    return new Vector3CompatibilityAdapter(this.value.subtract(v.value));
  }

  public scale(scalar: number): Vector3CompatibilityAdapter {
    return new Vector3CompatibilityAdapter(this.value.scale(scalar));
  }

  public dot(v: Vector3CompatibilityAdapter): number {
    return this.value.dot(v.value);
  }

  public cross(v: Vector3CompatibilityAdapter): Vector3CompatibilityAdapter {
    return new Vector3CompatibilityAdapter(this.value.cross(v.value));
  }

  public length(): number {
    return this.value.length();
  }

  public normalize(): Vector3CompatibilityAdapter {
    return new Vector3CompatibilityAdapter(this.value.normalize());
  }

  public clone(): Vector3CompatibilityAdapter {
    return new Vector3CompatibilityAdapter(this.value.clone());
  }

  public transform(
    matrix: Float32Array | number[],
  ): Vector3CompatibilityAdapter {
    return new Vector3CompatibilityAdapter(this.value.transform(matrix));
  }

  public angleTo(v: Vector3CompatibilityAdapter): number {
    return this.value.angleTo(v.value);
  }

  public projectOnto(
    v: Vector3CompatibilityAdapter,
  ): Vector3CompatibilityAdapter {
    return new Vector3CompatibilityAdapter(this.value.projectOnto(v.value));
  }

  public reflect(
    normal: Vector3CompatibilityAdapter,
  ): Vector3CompatibilityAdapter {
    return new Vector3CompatibilityAdapter(this.value.reflect(normal.value));
  }

  public lerp(
    v: Vector3CompatibilityAdapter,
    t: number,
  ): Vector3CompatibilityAdapter {
    return new Vector3CompatibilityAdapter(this.value.lerp(v.value, t));
  }

  public distanceTo(v: Vector3CompatibilityAdapter): number {
    return this.value.distanceTo(v.value);
  }

  public equals(
    v: Vector3CompatibilityAdapter,
    tolerance?: number,
  ): boolean {
    return this.value.equals(v.value, tolerance);
  }

  public toArray(): number[] {
    return this.value.toArray();
  }

  public toFloat32Array(): Float32Array {
    return this.value.toFloat32Array();
  }

  public unwrap(): Vector3Gpu {
    return this.value.clone();
  }
}