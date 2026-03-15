
import { Vector3 } from "@monorepo/core-math";
import { IUniformGrid3 } from "./IUniformGrid3.js";
import {NumberGuards} from '../guards/NumberGuards.js';

export class UniformGrid3 implements IUniformGrid3 {
  public readonly extent: Vector3;

  public constructor(
    public readonly resolution: Vector3,
    public readonly spacing: Vector3,
    public readonly origin: Vector3 = new Vector3(0, 0, 0)
  ) {
    NumberGuards.ensurePositive(resolution.x, "resolution.x");
    NumberGuards.ensurePositive(resolution.y, "resolution.y");
    NumberGuards.ensurePositive(resolution.z, "resolution.z");
    NumberGuards.ensurePositive(spacing.x, "spacing.x");
    NumberGuards.ensurePositive(spacing.y, "spacing.y");
    NumberGuards.ensurePositive(spacing.z, "spacing.z");

    this.extent = new Vector3(
      resolution.x * spacing.x,
      resolution.y * spacing.y,
      resolution.z * spacing.z
    );
  }

  public get width(): number {
    return this.resolution.x;
  }

  public get height(): number {
    return this.resolution.y;
  }

  public get depth(): number {
    return this.resolution.z;
  }

  public isInside(i: number, j: number, k: number): boolean {
    return (
      i >= 0 && i < this.width &&
      j >= 0 && j < this.height &&
      k >= 0 && k < this.depth
    );
  }

  public coordinateAt(i: number, j: number, k: number): Vector3 {
    if (!this.isInside(i, j, k)) {
      throw new RangeError(`Index out of range: (${i}, ${j}, ${k}).`);
    }

    return new Vector3(
      this.origin.x + (i * this.spacing.x),
      this.origin.y + (j * this.spacing.y),
      this.origin.z + (k * this.spacing.z)
    );
  }
}
