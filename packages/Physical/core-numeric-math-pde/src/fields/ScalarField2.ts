import { NumericGuards } from "@monorepo/core-numeric-math";
import { IUniformGrid2 } from "../grid/IUniformGrid2.js";
import { IScalarField2 } from "./IScalarField2.js";


export class ScalarField2 implements IScalarField2 {
  private readonly values: Float64Array;

  public constructor(
    public readonly grid: IUniformGrid2,
    initial?: Iterable<number> | ArrayLike<number>
  ) {
    this.values = new Float64Array(grid.width * grid.height);

    if (initial !== undefined) {
      const copy = new Float64Array(Array.isArray(initial) ? initial : Array.from(initial));
      if (copy.length !== this.values.length) {
        throw new Error(`Initial buffer size mismatch. Expected ${this.values.length}, got ${copy.length}.`);
      }
      this.values.set(copy);
    }
  }

  public sample(i: number, j: number): number {
    return this.values[this.indexOf(i, j)]!;
  }

  public write(i: number, j: number, value: number): void {
    NumericGuards.ensureFinite(value, "value");
    this.values[this.indexOf(i, j)] = value;
  }

  public fill(value: number): void {
    NumericGuards.ensureFinite(value, "value");
    this.values.fill(value);
  }

  public raw(): Float64Array {
    return this.values;
  }

  private indexOf(i: number, j: number): number {
    if (!this.grid.isInside(i, j)) {
      throw new RangeError(`Index out of range: (${i}, ${j}).`);
    }

    return (j * this.grid.width) + i;
  }
}
