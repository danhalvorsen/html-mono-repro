import { AxisRange } from "./axis-range.js";

export interface AxisRangeLike {
  readonly min: number;
  readonly max: number;

  span(): number;
}

export class AxisIntervalScaler {
  public scaleFromHorizontalDrag(range: AxisRangeLike, dragDeltaX: number): AxisRange {
    const center = (range.min + range.max) / 2;
    const halfSpan = range.span() / 2;
    const factor = Math.max(0.2, 1 + dragDeltaX / 240);
    const nextHalfSpan = Math.max(1, halfSpan * factor);

    return new AxisRange(
      Math.round((center - nextHalfSpan) * 1000) / 1000,
      Math.round((center + nextHalfSpan) * 1000) / 1000,
    );
  }
}
