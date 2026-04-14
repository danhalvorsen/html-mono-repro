export class AxisRange {
  private currentMin: number;
  private currentMax: number;

  public constructor(min = -10, max = 10) {
    this.assertRange(min, max);
    this.currentMin = min;
    this.currentMax = max;
  }

  public get min(): number {
    return this.currentMin;
  }

  public get max(): number {
    return this.currentMax;
  }

  public set(min: number, max: number): void {
    this.assertRange(min, max);
    this.currentMin = min;
    this.currentMax = max;
  }

  public span(): number {
    return this.currentMax - this.currentMin;
  }

  private assertRange(min: number, max: number): void {
    if (min >= max) {
      throw new Error("AxisRange requires min < max");
    }
  }
}
