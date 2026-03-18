// ============================================================================
// packages/math-core-gpu/src/adapters/Vector2CompatibilityAdapter.ts
// ============================================================================

import { IVector } from "../interfaces/IVector.js";
import { Vector2Gpu } from "../primitives/Vector2Gpu.js";

export class Vector2CompatibilityAdapter implements IVector<Vector2CompatibilityAdapter> {
  private readonly value: Vector2Gpu;

  public constructor(value?: Vector2Gpu) {
    this.value = value?.clone() ?? Vector2Gpu.Zero;
  }

  public get x(): number { return this.value.x; }
  public get y(): number { return this.value.y; }
  public get z(): number { return 0; }

  public add(v: Vector2CompatibilityAdapter): Vector2CompatibilityAdapter {
    return new Vector2CompatibilityAdapter(this.value.add(v.value));
  }

  public subtract(v: Vector2CompatibilityAdapter): Vector2CompatibilityAdapter {
    return new Vector2CompatibilityAdapter(this.value.subtract(v.value));
  }

  public scale(scalar: number): Vector2CompatibilityAdapter {
    return new Vector2CompatibilityAdapter(this.value.scale(scalar));
  }

  public dot(v: Vector2CompatibilityAdapter): number {
    return this.value.dot(v.value);
  }

  public cross(v: Vector2CompatibilityAdapter): Vector2CompatibilityAdapter {
    return new Vector2CompatibilityAdapter(this.value.cross(v.value));
  }

  public length(): number {
    return this.value.length();
  }

  public normalize(): Vector2CompatibilityAdapter {
    return new Vector2CompatibilityAdapter(this.value.normalize());
  }

  public clone(): Vector2CompatibilityAdapter {
    return new Vector2CompatibilityAdapter(this.value.clone());
  }

  public transform(matrix: Float32Array | number[]): Vector2CompatibilityAdapter {
    return new Vector2CompatibilityAdapter(this.value.transform(matrix));
  }

  public angleTo(v: Vector2CompatibilityAdapter): number {
    return this.value.angleTo(v.value);
  }

  public projectOnto(v: Vector2CompatibilityAdapter): Vector2CompatibilityAdapter {
    return new Vector2CompatibilityAdapter(this.value.projectOnto(v.value));
  }

  public reflect(normal: Vector2CompatibilityAdapter): Vector2CompatibilityAdapter {
    return new Vector2CompatibilityAdapter(this.value.reflect(normal.value));
  }

  public lerp(v: Vector2CompatibilityAdapter, t: number): Vector2CompatibilityAdapter {
    return new Vector2CompatibilityAdapter(this.value.lerp(v.value, t));
  }

  public distanceTo(v: Vector2CompatibilityAdapter): number {
    return this.value.distanceTo(v.value);
  }

  public equals(v: Vector2CompatibilityAdapter, tolerance?: number): boolean {
    return this.value.equals(v.value, tolerance);
  }

  public toArray(): number[] {
    return this.value.toArray();
  }

  public toFloat32Array(): Float32Array {
    return this.value.toFloat32Array();
  }

  public unwrap(): Vector2Gpu {
    return this.value.clone();
  }
}
