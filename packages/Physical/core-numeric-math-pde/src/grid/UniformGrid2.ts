 
import { Vector2 } from "@monorepo/core-math";
import { IUniformGrid2 } from "./IUniformGrid2.js";
import {NumberGuards} from '../guards/NumberGuards.js';
export class UniformGrid2 implements IUniformGrid2 {
  public readonly extent: Vector2;

  public constructor(
    public readonly resolution: Vector2,
    public readonly spacing: Vector2,
    public readonly origin: Vector2 = new Vector2(0, 0)
  ) {
    NumberGuards.ensurePositive(resolution.x, "resolution.x");
    NumberGuards.ensurePositive(resolution.y, "resolution.y");
    NumberGuards.ensurePositive(spacing.x, "spacing.x");
    NumberGuards.ensurePositive(spacing.y, "spacing.y");

    this.extent = new Vector2(
      resolution.x * spacing.x,
      resolution.y * spacing.y
    );
  }

  public get width(): number {
    return this.resolution.x;
  }

  public get height(): number {
    return this.resolution.y;
  }

  public isInside(i: number, j: number): boolean {
    return i >= 0 && i < this.width && j >= 0 && j < this.height;
  }

  public coordinateAt(i: number, j: number): Vector2 {
    if (!this.isInside(i, j)) {
      throw new RangeError(`Index out of range: (${i}, ${j}).`);
    }

    return new Vector2(
      this.origin.x + (i * this.spacing.x),
      this.origin.y + (j * this.spacing.y)
    );
  }
}
