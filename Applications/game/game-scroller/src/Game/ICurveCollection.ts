import type { Point2 } from '../../../../../packages/core-math/dist/interfaces/IPoint';


export interface ICurveCollection {
  readonly reference: readonly Point2[];
  readonly upper: readonly Point2[];
  readonly lower: readonly Point2[];
}
