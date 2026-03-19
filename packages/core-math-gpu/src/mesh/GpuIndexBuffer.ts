// ============================================================================
// packages/math-core-gpu/src/mesh/GpuIndexBuffer.ts
// ============================================================================

import { Guard } from "../common/Guard.js";

export class GpuIndexBuffer {
  private readonly values: Uint32Array;

  public constructor(indexCapacity: number) {
    Guard.nonNegative(indexCapacity, "indexCapacity");
    this.values = new Uint32Array(indexCapacity);
  }

  public get count(): number {
    return this.values.length;
  }

  public get raw(): Uint32Array {
    return this.values;
  }

  public set(index: number, value: number): void {
    Guard.index(index, this.values.length, "index");
    Guard.nonNegative(value, "value");
    this.values[index] = value;
  }

  public get(index: number): number {
    Guard.index(index, this.values.length, "index");
    return this.values[index]!; //CHECKPOINT: This should never be undefined due to the type of Uint32Array, but the non-null assertion is needed to satisfy the type checker.                                    
  }

  public copyFrom(values: readonly number[]): void {
    if (values.length !== this.values.length) {
      throw new Error("Index count mismatch.");
    }

    this.values.set(values);
  }
}