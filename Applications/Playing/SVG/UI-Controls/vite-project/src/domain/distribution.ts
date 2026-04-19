import type { Point } from './geometry.js'

export interface DistributionInput {
  readonly points: ReadonlyArray<Point>
  readonly closed: boolean
  readonly shapeCount: number
  readonly startOffset: number
  readonly endOffset: number
}
