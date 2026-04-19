export interface Point {
  readonly x: number
  readonly y: number
}

export interface BoundingBox {
  readonly minX: number
  readonly minY: number
  readonly maxX: number
  readonly maxY: number
  readonly width: number
  readonly height: number
}

export interface Segment {
  readonly start: Point
  readonly end: Point
  readonly length: number
  readonly startDistance: number
  readonly endDistance: number
}

export interface Placement {
  readonly x: number
  readonly y: number
  readonly angleDeg: number
  readonly distance: number
}

export function createBoundingBox(
  points: ReadonlyArray<Point>,
  padding = 0,
): BoundingBox {
  if (points.length === 0) {
    return {
      minX: -padding,
      minY: -padding,
      maxX: padding,
      maxY: padding,
      width: Math.max(1, padding * 2),
      height: Math.max(1, padding * 2),
    }
  }

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const point of points) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }

  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
    width: Math.max(1, maxX - minX + padding * 2),
    height: Math.max(1, maxY - minY + padding * 2),
  }
}
