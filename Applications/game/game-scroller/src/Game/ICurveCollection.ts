import type { Point2 } from "@monorepo/core-math";


export interface ICurveCollection {
  readonly reference: readonly Point2[];
  readonly upper: readonly Point2[];
  readonly lower: readonly Point2[];
}
