export class AxisRange {
  public readonly min: number;
  public readonly max: number;

  public constructor(min = -10, max = 10) {
    if (min >= max) {
      throw new Error("AxisRange requires min < max");
    }

    this.min = min;
    this.max = max;
  }

  public span(): number {
    return this.max - this.min;
  }
}
