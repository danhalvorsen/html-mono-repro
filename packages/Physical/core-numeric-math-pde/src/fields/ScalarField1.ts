import { NumericGuards } from "@monorepo/core-numeric-math";
import { IUniformGrid1 } from "../grid/IUniformGrid1.js";
import { IScalarField1 } from "./IScalarField1.js";

// ============================================================
// FIELD IMPLEMENTATIONS
// ============================================================

export class ScalarField1 implements IScalarField1 {
  private readonly values: Float64Array;

  public constructor(
    public readonly grid: IUniformGrid1,
    initial?: Iterable<number> | ArrayLike<number>
  ) {
    this.values = new Float64Array(grid.size);

    if (initial !== undefined) {
      const copy = Float64Array.from(Array.from(initial));
      if (copy.length !== this.values.length) {
        throw new Error(`Initial buffer size mismatch. Expected ${this.values.length}, got ${copy.length}.`);
      }
      this.values.set(copy);
    }
  }

  public sample(i: number): number {
    if (!this.grid.isInside(i)) {
      throw new RangeError(`Index out of range: ${i}.`);
    }

    return this.values[i]!;
  }

  public write(i: number, value: number): void {
    if (!this.grid.isInside(i)) {
      throw new RangeError(`Index out of range: ${i}.`);
    }

    NumericGuards.ensureFinite(value, "value");
    this.values[i] = value;
  }

  public fill(value: number): void {
    NumericGuards.ensureFinite(value, "value");
    this.values.fill(value);
  }

  public raw(): Float64Array {
    return this.values;
  }
}
