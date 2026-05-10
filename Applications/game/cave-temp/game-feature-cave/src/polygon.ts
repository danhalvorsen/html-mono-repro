import { Vector2 } from '@monorepo/core-math';

export class Polygon {
  public readonly points: ReadonlyArray<Vector2>;
  public readonly closed: boolean;

  public constructor(points: ReadonlyArray<Vector2>, closed = false) {
    if (points.length < 2) {
      throw new Error('Polygon requires at least 2 points.');
    }

    this.points = Object.freeze([...points]);
    this.closed = closed;
  }

  public withClosed(): Polygon {
    if (this.closed) {
      return this;
    }

    const first = this.points[0];
    const last = this.points[this.points.length - 1];

    if (first === undefined || last === undefined) {
      throw new Error('Polygon requires at least 2 points.');
    }

    if (first.equals(last)) {
      return new Polygon(this.points, true);
    }

    return new Polygon([...this.points, first], true);
  }

  public merge(other: Polygon): Polygon {
    const currentEnd = this.points[this.points.length - 1];
    const otherStart = other.points[0];

    if (currentEnd === undefined || otherStart === undefined) {
      throw new Error('Cannot merge polygons without endpoints.');
    }

    if (!currentEnd.equals(otherStart)) {
      throw new Error('Cannot merge polygons: endpoints do not match.');
    }

    return new Polygon([...this.points, ...other.points.slice(1)], false);
  }
}
