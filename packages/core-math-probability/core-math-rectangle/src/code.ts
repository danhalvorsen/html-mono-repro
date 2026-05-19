// ============================================================================
// FILE: packages/core-math-box/src/code.ts
// ============================================================================

import {
  EPSILON,
  Guard,
  Matrix4Gpu,
  Vector2Gpu,
  Vector3Gpu,
} from "@monorepo/core-math-gpu";
import { IBox2 } from "./IBox2.js";
import { IBox3 } from "./IBox3.js";
import { IBox2Collision } from "./IBox2Collision.js";
import { IBox3Collision } from "./IBox3Collision.js";
import { Box3 } from "./Box3.js";
import { Aabb3 } from "./Aabb3.js";
import { Obb3 } from "./Obb3.js";
export { Box3 } from "./Box3.js";

export interface IBoxModule {
  createBox2(
    v0: Vector2Gpu,
    v1: Vector2Gpu,
    v2: Vector2Gpu,
    v3: Vector2Gpu,
  ): Box2;

  createAabb2(min: Vector2Gpu, max: Vector2Gpu): Aabb2;
  createObb2(center: Vector2Gpu, halfSize: Vector2Gpu, rotationRadians: number): Obb2;

  createBox3(
    center: Vector3Gpu,
    halfSize: Vector3Gpu,
    axisX?: Vector3Gpu,
    axisY?: Vector3Gpu,
    axisZ?: Vector3Gpu,
  ): Box3;

  createAabb3(min: Vector3Gpu, max: Vector3Gpu): Aabb3;
  createObb3(center: Vector3Gpu, halfSize: Vector3Gpu, orientation: Matrix4Gpu): Obb3;

  createBox2Collision(): IBox2Collision;
  createBox3Collision(): IBox3Collision;
}

// ============================================================================
// BOX2
// ============================================================================

export class Box2 implements IBox2 {
  private readonly vertices: readonly [Vector2Gpu, Vector2Gpu, Vector2Gpu, Vector2Gpu];

  public constructor(
    v0: Vector2Gpu,
    v1: Vector2Gpu,
    v2: Vector2Gpu,
    v3: Vector2Gpu,
  ) {
    this.vertices = Box2.validateAndClone(v0, v1, v2, v3);
  }

  public getVertices(): readonly Vector2Gpu[] {
    return this.vertices.map((value) => value.clone());
  }

  public getEdges(): readonly (readonly [Vector2Gpu, Vector2Gpu])[] {
    const [v0, v1, v2, v3] = this.vertices;

    return [
      [v0.clone(), v1.clone()] as const,
      [v1.clone(), v2.clone()] as const,
      [v2.clone(), v3.clone()] as const,
      [v3.clone(), v0.clone()] as const,
    ];
  }

  public getAxes(): readonly Vector2Gpu[] {
    const [v0, v1, , v3] = this.vertices;

    return [
      v1.subtract(v0).normalize(),
      v3.subtract(v0).normalize(),
    ];
  }

  public width(): number {
    const [v0, v1] = this.vertices;
    return v0.distanceTo(v1);
  }

  public height(): number {
    const [, v1, v2] = this.vertices;
    return v1.distanceTo(v2);
  }

  public area(): number {
    return this.width() * this.height();
  }

  public perimeter(): number {
    return 2 * (this.width() + this.height());
  }

  public center(): Vector2Gpu {
    const [v0, , v2] = this.vertices;
    return v0.add(v2).scale(0.5);
  }

  public contains(point: Vector2Gpu): boolean {
    const [v0, v1, , v3] = this.vertices;

    const axisX = v1.subtract(v0);
    const axisY = v3.subtract(v0);
    const delta = point.subtract(v0);

    const xProjection = delta.dot(axisX);
    const yProjection = delta.dot(axisY);

    const xExtent = axisX.dot(axisX);
    const yExtent = axisY.dot(axisY);

    return (
      xProjection >= -EPSILON &&
      xProjection <= xExtent + EPSILON &&
      yProjection >= -EPSILON &&
      yProjection <= yExtent + EPSILON
    );
  }

  private static validateAndClone(
    v0: Vector2Gpu,
    v1: Vector2Gpu,
    v2: Vector2Gpu,
    v3: Vector2Gpu,
  ): readonly [Vector2Gpu, Vector2Gpu, Vector2Gpu, Vector2Gpu] {
    const a = v0.clone();
    const b = v1.clone();
    const c = v2.clone();
    const d = v3.clone();

    const ab = b.subtract(a);
    const bc = c.subtract(b);
    const cd = d.subtract(c);
    const da = a.subtract(d);

    Box2.ensurePositiveLength(ab.length(), "edge AB");
    Box2.ensurePositiveLength(bc.length(), "edge BC");
    Box2.ensurePositiveLength(cd.length(), "edge CD");
    Box2.ensurePositiveLength(da.length(), "edge DA");

    if (Math.abs(ab.dot(bc)) > EPSILON) {
      throw new Error("Box2 adjacent edges must be orthogonal.");
    }

    if (Math.abs(ab.length() - cd.length()) > EPSILON) {
      throw new Error("Box2 opposite horizontal edges must have equal length.");
    }

    if (Math.abs(bc.length() - da.length()) > EPSILON) {
      throw new Error("Box2 opposite vertical edges must have equal length.");
    }

    return [a, b, c, d] as const;
  }

  private static ensurePositiveLength(value: number, name: string): void {
    Guard.finite(value, name);

    if (value <= EPSILON) {
      throw new Error(`${name} must be greater than zero.`);
    }
  }
}

// ============================================================================
// AABB2
// ============================================================================

export class Aabb2 extends Box2 {
  private readonly minValue: Vector2Gpu;
  private readonly maxValue: Vector2Gpu;

  public constructor(min: Vector2Gpu, max: Vector2Gpu) {
    Aabb2.validate(min, max);

    const minValue = min.clone();
    const maxValue = max.clone();

    super(
      new Vector2Gpu(minValue.x, minValue.y),
      new Vector2Gpu(maxValue.x, minValue.y),
      new Vector2Gpu(maxValue.x, maxValue.y),
      new Vector2Gpu(minValue.x, maxValue.y),
    );

    this.minValue = minValue;
    this.maxValue = maxValue;
  }

  public min(): Vector2Gpu {
    return this.minValue.clone();
  }

  public max(): Vector2Gpu {
    return this.maxValue.clone();
  }

  private static validate(min: Vector2Gpu, max: Vector2Gpu): void {
    if (max.x < min.x || max.y < min.y) {
      throw new Error("Aabb2 max must be greater than or equal to min.");
    }

    if (Math.abs(max.x - min.x) <= EPSILON || Math.abs(max.y - min.y) <= EPSILON) {
      throw new Error("Aabb2 dimensions must be greater than zero.");
    }
  }
}

// ============================================================================
// OBB2
// ============================================================================

export class Obb2 extends Box2 {
  private readonly centerValue: Vector2Gpu;
  private readonly halfSizeValue: Vector2Gpu;
  private readonly rotationRadiansValue: number;

  public constructor(
    center: Vector2Gpu,
    halfSize: Vector2Gpu,
    rotationRadians: number,
  ) {
    Guard.finite(rotationRadians, "rotationRadians");
    Obb2.validateHalfSize(halfSize);

    const c = center.clone();
    const hs = halfSize.clone();

    const cos = Math.cos(rotationRadians);
    const sin = Math.sin(rotationRadians);

    const axisX = new Vector2Gpu(cos, sin);
    const axisY = new Vector2Gpu(-sin, cos);

    const x = axisX.scale(hs.x);
    const y = axisY.scale(hs.y);

    super(
      c.subtract(x).subtract(y),
      c.add(x).subtract(y),
      c.add(x).add(y),
      c.subtract(x).add(y),
    );

    this.centerValue = c;
    this.halfSizeValue = hs;
    this.rotationRadiansValue = rotationRadians;
  }

  public orientationRadians(): number {
    return this.rotationRadiansValue;
  }

  public halfSize(): Vector2Gpu {
    return this.halfSizeValue.clone();
  }

  public override center(): Vector2Gpu {
    return this.centerValue.clone();
  }

  private static validateHalfSize(halfSize: Vector2Gpu): void {
    if (halfSize.x <= EPSILON || halfSize.y <= EPSILON) {
      throw new Error("Obb2 halfSize components must be greater than zero.");
    }
  }
}

// ============================================================================
// BOX2 COLLISION (SAT)
// ============================================================================

export class SeparatingAxisBox2Collision implements IBox2Collision {
  public intersects(left: IBox2, right: IBox2): boolean {
    const axes = [...left.getAxes(), ...right.getAxes()];

    for (const axis of axes) {
      if (axis.length() <= EPSILON) {
        continue;
      }

      const normalizedAxis = axis.normalize();
      const leftProjection = this.project(left.getVertices(), normalizedAxis);
      const rightProjection = this.project(right.getVertices(), normalizedAxis);

      if (!this.overlaps(leftProjection, rightProjection)) {
        return false;
      }
    }

    return true;
  }

  private project(
    vertices: readonly Vector2Gpu[],
    axis: Vector2Gpu,
  ): readonly [number, number] {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const vertex of vertices) {
      const value = vertex.dot(axis);

      if (value < min) {
        min = value;
      }

      if (value > max) {
        max = value;
      }
    }

    return [min, max] as const;
  }

  private overlaps(
    left: readonly [number, number],
    right: readonly [number, number],
  ): boolean {
    return !(left[1] < right[0] || right[1] < left[0]);
  }
}

// ============================================================================
// BOX3 COLLISION (SAT)
// ============================================================================

export class SeparatingAxisBox3Collision implements IBox3Collision {
  public intersects(left: IBox3, right: IBox3): boolean {
    const leftAxes = left.getAxes();
    const rightAxes = right.getAxes();
    const axes: Vector3Gpu[] = [];

    for (const axis of leftAxes) {
      if (axis.length() > EPSILON) {
        axes.push(axis.normalize());
      }
    }

    for (const axis of rightAxes) {
      if (axis.length() > EPSILON) {
        axes.push(axis.normalize());
      }
    }

    for (const leftAxis of leftAxes) {
      for (const rightAxis of rightAxes) {
        const cross = leftAxis.cross(rightAxis);

        if (cross.length() > EPSILON) {
          axes.push(cross.normalize());
        }
      }
    }

    for (const axis of axes) {
      const leftProjection = this.project(left.getVertices(), axis);
      const rightProjection = this.project(right.getVertices(), axis);

      if (!this.overlaps(leftProjection, rightProjection)) {
        return false;
      }
    }

    return true;
  }

  private project(
    vertices: readonly Vector3Gpu[],
    axis: Vector3Gpu,
  ): readonly [number, number] {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const vertex of vertices) {
      const value = vertex.dot(axis);

      if (value < min) {
        min = value;
      }

      if (value > max) {
        max = value;
      }
    }

    return [min, max] as const;
  }

  private overlaps(
    left: readonly [number, number],
    right: readonly [number, number],
  ): boolean {
    return !(left[1] < right[0] || right[1] < left[0]);
  }
}

// ============================================================================
// COMPOSITION ROOT
// ============================================================================

export class BoxCompositionRoot implements IBoxModule {
  public createBox2(
    v0: Vector2Gpu,
    v1: Vector2Gpu,
    v2: Vector2Gpu,
    v3: Vector2Gpu,
  ): Box2 {
    return new Box2(v0, v1, v2, v3);
  }

  public createAabb2(min: Vector2Gpu, max: Vector2Gpu): Aabb2 {
    return new Aabb2(min, max);
  }

  public createObb2(
    center: Vector2Gpu,
    halfSize: Vector2Gpu,
    rotationRadians: number,
  ): Obb2 {
    return new Obb2(center, halfSize, rotationRadians);
  }

  public createBox3(
    center: Vector3Gpu,
    halfSize: Vector3Gpu,
    axisX: Vector3Gpu = Vector3Gpu.UnitX,
    axisY: Vector3Gpu = Vector3Gpu.UnitY,
    axisZ: Vector3Gpu = Vector3Gpu.UnitZ,
  ): Box3 {
    return new Box3(center, halfSize, axisX, axisY, axisZ);
  }

  public createAabb3(min: Vector3Gpu, max: Vector3Gpu): Aabb3 {
    return new Aabb3(min, max);
  }

  public createObb3(
    center: Vector3Gpu,
    halfSize: Vector3Gpu,
    orientation: Matrix4Gpu,
  ): Obb3 {
    return new Obb3(center, halfSize, orientation);
  }

  public createBox2Collision(): IBox2Collision {
    return new SeparatingAxisBox2Collision();
  }

  public createBox3Collision(): IBox3Collision {
    return new SeparatingAxisBox3Collision();
  }
}
