import { assertFinite } from "./number-guards.js";

export class Range {
  public constructor(
    public readonly min: number,
    public readonly max: number,
  ) {
    assertFinite(min, "min");
    assertFinite(max, "max");

    if (max <= min) {
      throw new Error("max must be > min");
    }
  }

  public clamp(value: number): number {
    assertFinite(value, "value");
    return Math.max(this.min, Math.min(this.max, value));
  }

  public normalize(value: number): number {
    const clamped = this.clamp(value);
    return (clamped - this.min) / (this.max - this.min);
  }
}
