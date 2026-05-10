import type { Point2 } from '@monorepo/core-math';

export class Polygon {
  public readonly points: readonly Point2[];

  public constructor(points: readonly Point2[]) {
    if (points.length < 2) {
      throw new RangeError('Polygon requires at least 2 points.');
    }

    this.points = Object.freeze(points.map(point => ({
      x: point.x,
      y: point.y,
    })));
  }
}
