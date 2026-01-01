import type { Point2 } from '@monorepo/core-math'

export class PlotPointsPayload {
  readonly points: Point2[]

  constructor(points: Point2[]) {
    this.points = points
  }
}
