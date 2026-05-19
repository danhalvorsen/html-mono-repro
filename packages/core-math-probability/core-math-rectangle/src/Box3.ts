import { EPSILON, Matrix4Gpu, Vector3Gpu } from "@monorepo/core-math-gpu";
import { IBox3 } from "./IBox3.js";

export class Box3 implements IBox3 {
  private readonly centerValue: Vector3Gpu;
  private readonly halfSizeValue: Vector3Gpu;
  private readonly axisXValue: Vector3Gpu;
  private readonly axisYValue: Vector3Gpu;
  private readonly axisZValue: Vector3Gpu;

  public constructor(
    center: Vector3Gpu,
    halfSize: Vector3Gpu,
    axisX: Vector3Gpu = Vector3Gpu.UnitX,
    axisY: Vector3Gpu = Vector3Gpu.UnitY,
    axisZ: Vector3Gpu = Vector3Gpu.UnitZ,
  ) {
    Box3.validateHalfSize(halfSize);
    Box3.validateAxes(axisX, axisY, axisZ);

    this.centerValue = center.clone();
    this.halfSizeValue = halfSize.clone();
    this.axisXValue = axisX.normalize();
    this.axisYValue = axisY.normalize();
    this.axisZValue = axisZ.normalize();
  }

  public center(): Vector3Gpu {
    return this.centerValue.clone();
  }

  public halfSize(): Vector3Gpu {
    return this.halfSizeValue.clone();
  }

  public axisX(): Vector3Gpu {
    return this.axisXValue.clone();
  }

  public axisY(): Vector3Gpu {
    return this.axisYValue.clone();
  }

  public axisZ(): Vector3Gpu {
    return this.axisZValue.clone();
  }

  public width(): number {
    return this.halfSizeValue.x * 2;
  }

  public height(): number {
    return this.halfSizeValue.y * 2;
  }

  public depth(): number {
    return this.halfSizeValue.z * 2;
  }

  public volume(): number {
    return this.width() * this.height() * this.depth();
  }

  public getVertices(): readonly Vector3Gpu[] {
    const x = this.axisXValue.scale(this.halfSizeValue.x);
    const y = this.axisYValue.scale(this.halfSizeValue.y);
    const z = this.axisZValue.scale(this.halfSizeValue.z);
    const c = this.centerValue;

    return [
      c.subtract(x).subtract(y).subtract(z),
      c.add(x).subtract(y).subtract(z),
      c.add(x).add(y).subtract(z),
      c.subtract(x).add(y).subtract(z),
      c.subtract(x).subtract(y).add(z),
      c.add(x).subtract(y).add(z),
      c.add(x).add(y).add(z),
      c.subtract(x).add(y).add(z),
    ];
  }

  public getEdges(): readonly (readonly [Vector3Gpu, Vector3Gpu])[] {
    const vertices = this.getVertices();
    const [v0, v1, v2, v3, v4, v5, v6, v7] = vertices as [Vector3Gpu, Vector3Gpu, Vector3Gpu, Vector3Gpu, Vector3Gpu, Vector3Gpu, Vector3Gpu, Vector3Gpu];

    return [
      [v0, v1] as const,
      [v1, v2] as const,
      [v2, v3] as const,
      [v3, v0] as const,
      [v4, v5] as const,
      [v5, v6] as const,
      [v6, v7] as const,
      [v7, v4] as const,
      [v0, v4] as const,
      [v1, v5] as const,
      [v2, v6] as const,
      [v3, v7] as const,
    ];
  }

  public getAxes(): readonly Vector3Gpu[] {
    return [
      this.axisXValue.clone(),
      this.axisYValue.clone(),
      this.axisZValue.clone(),
    ];
  }

  public contains(point: Vector3Gpu): boolean {
    const delta = point.subtract(this.centerValue);

    const x = delta.dot(this.axisXValue);
    const y = delta.dot(this.axisYValue);
    const z = delta.dot(this.axisZValue);

    return (
      Math.abs(x) <= this.halfSizeValue.x + EPSILON &&
      Math.abs(y) <= this.halfSizeValue.y + EPSILON &&
      Math.abs(z) <= this.halfSizeValue.z + EPSILON
    );
  }

  protected static createAxesFromOrientation(
    orientation: Matrix4Gpu,
  ): readonly [Vector3Gpu, Vector3Gpu, Vector3Gpu] {
    const values = orientation.toFloat32Array();

    const axisX = new Vector3Gpu(values[0], values[1], values[2]).normalize();
    const axisY = new Vector3Gpu(values[4], values[5], values[6]).normalize();
    const axisZ = new Vector3Gpu(values[8], values[9], values[10]).normalize();

    Box3.validateAxes(axisX, axisY, axisZ);

    return [axisX, axisY, axisZ] as const;
  }

  private static validateHalfSize(halfSize: Vector3Gpu): void {
    if (
      halfSize.x <= EPSILON ||
      halfSize.y <= EPSILON ||
      halfSize.z <= EPSILON
    ) {
      throw new Error("Box3 halfSize components must be greater than zero.");
    }
  }

  private static validateAxes(
    axisX: Vector3Gpu,
    axisY: Vector3Gpu,
    axisZ: Vector3Gpu,
  ): void {
    const x = axisX.normalize();
    const y = axisY.normalize();
    const z = axisZ.normalize();

    if (Math.abs(x.dot(y)) > EPSILON) {
      throw new Error("Box3 axisX and axisY must be orthogonal.");
    }

    if (Math.abs(x.dot(z)) > EPSILON) {
      throw new Error("Box3 axisX and axisZ must be orthogonal.");
    }

    if (Math.abs(y.dot(z)) > EPSILON) {
      throw new Error("Box3 axisY and axisZ must be orthogonal.");
    }
  }
}
