import { NumericGuards } from "@monorepo/core-numeric-math";
import { IUniformGrid3 } from "../grid/IUniformGrid3.js";
import { IScalarField3 } from "./IScalarField3.js";

export class ScalarField3 implements IScalarField3 {
  private readonly values: Float64Array;

  public constructor(
    public readonly grid: IUniformGrid3,
    initial?: Iterable<number> | ArrayLike<number>
  ) {
    this.values = new Float64Array(grid.width * grid.height * grid.depth);

    if (initial !== undefined) {
      const isIterable = typeof (initial as Iterable<number>)[Symbol.iterator] === "function";
      const copy = ArrayBuffer.isView(initial)
        ? Float64Array.from(initial as ArrayLike<number>)
        : isIterable
          ? Float64Array.from(initial as Iterable<number>)
          : Float64Array.from(initial as ArrayLike<number>);
      if (copy.length !== this.values.length) {
        throw new Error(`Initial buffer size mismatch. Expected ${this.values.length}, got ${copy.length}.`);
      }
      this.values.set(copy);
    }
  }

  public sample(i: number, j: number, k: number): number {
    return this.values[this.indexOf(i, j, k)]!;
  }

  public write(i: number, j: number, k: number, value: number): void {
    NumericGuards.ensureFinite(value, "value");
    this.values[this.indexOf(i, j, k)] = value;
  }

  public fill(value: number): void {
    NumericGuards.ensureFinite(value, "value");
    this.values.fill(value);
  }

  public raw(): Float64Array {
    return this.values;
  }

  private indexOf(i: number, j: number, k: number): number {
    if (!this.grid.isInside(i, j, k)) {
      throw new RangeError(`Index out of range: (${i}, ${j}, ${k}).`);
    }

    return i + (j * this.grid.width) + (k * this.grid.width * this.grid.height);
  }
}
