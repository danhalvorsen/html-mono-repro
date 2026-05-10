import { ParametricAxisExpressionOptions } from "./ParametricAxisExpressionOptions.js";

export interface ParametricMotionSegmentOptions {
  /**
   * Absolute start time.
   * The coordinate expression is evaluated with local time:
   * localT = timeSeconds - startsAtSeconds.
   */
  readonly startsAtSeconds: number;

  /**
   * x(t), y(t).
   */
  readonly coordinate: ParametricAxisExpressionOptions;
}

export interface ParametricMotionMathOptions {
  readonly coordinateSegments: readonly ParametricMotionSegmentOptions[];
}
