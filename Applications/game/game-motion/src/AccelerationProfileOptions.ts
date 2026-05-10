import { ParametricAxisExpressionOptions } from "./ParametricAxisExpressionOptions.js";

export interface AccelerationSegmentOptions {
  /**
   * Absolute start time.
   * The acceleration expression is evaluated with local time:
   * localT = timeSeconds - startsAtSeconds.
   */
  readonly startsAtSeconds: number;

  /**
   * ax(t), ay(t).
   */
  readonly acceleration: ParametricAxisExpressionOptions;
}

export interface AccelerationProfileOptions {
  readonly accelerationSegments: readonly AccelerationSegmentOptions[];
}
