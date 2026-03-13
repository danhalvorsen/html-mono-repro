import { Vector2 } from "@monorepo/core-math";
import { IUniformGrid1 } from "./IUniformGrid1.js";
import {NumberGuards} from '../guards/NumberGuards.js';

// ============================================================
// GRID IMPLEMENTATIONS
// ============================================================

export class UniformGrid1 implements IUniformGrid1 {
  public readonly length: number;

  public constructor(
    public readonly size: number,
    public readonly spacing: number,
    public readonly origin: number = 0
  ) {
    NumberGuards.ensurePositive(size, "size");
    NumberGuards.ensurePositive(spacing, "spacing");
    NumberGuards.ensureFinite(origin, "origin");

    this.length = size * spacing;
  }

  public isInside(i: number): boolean {
    return i >= 0 && i < this.size;
  }

  public coordinateAt(i: number): number {
    if (!this.isInside(i)) {
      throw new RangeError(`Index out of range: ${i}.`);
    }

    return this.origin + (i * this.spacing);
  }
}
