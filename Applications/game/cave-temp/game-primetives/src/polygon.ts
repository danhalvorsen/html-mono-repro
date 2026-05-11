import { Vector2 } from '@monorepo/core-math';

export class Polygon {
  public readonly points: ReadonlyArray<Vector2>;
  public readonly closed: boolean;

  public constructor(points: ReadonlyArray<Vector2>, closed = false) {
    if (points.length < 2) {
      throw new RangeError('Polygon requires at least 2 points.');
    }

    const normalized = Polygon.removeDuplicatedClosingPoint(points);

    if (closed && normalized.length < 3) {
      throw new RangeError('Closed polygon requires at least 3 points.');
    }

    this.closed = closed;
    this.points = Object.freeze(normalized.map(p => p.clone()));
  }

  public withClosed(): Polygon {
    return this.closed ? this : new Polygon(this.points, true);
  }

  public withOpen(): Polygon {
    return this.closed ? new Polygon(this.points, false) : this;
  }

  public canMerge(other: Polygon): boolean {
    return this.end.equals(other.start);
  }

  public merge(other: Polygon): Polygon {
    if (this.closed || other.closed) {
      throw new Error('Only open polygons can be merged.');
    }

    if (!this.canMerge(other)) {
      throw new Error('Cannot merge polygons: endpoints do not match.');
    }

    const mergedPoints = [
      ...this.points,
      ...other.points.slice(1),
    ];

    const first = mergedPoints[0]!;
    const last = mergedPoints[mergedPoints.length - 1]!;

    return new Polygon(
      Polygon.removeDuplicatedClosingPoint(mergedPoints),
      first.equals(last),
    );
  }

  public get start(): Vector2 {
    return this.points[0]!;
  }

  public get end(): Vector2 {
    return this.points[this.points.length - 1]!;
  }

  private static removeDuplicatedClosingPoint(
    points: ReadonlyArray<Vector2>,
  ): Vector2[] {
    if (points.length < 2) {
      return [...points];
    }

    const first = points[0]!;
    const last = points[points.length - 1]!;

    if (!first.equals(last)) {
      return [...points];
    }

    return points.slice(0, -1);
  }
}
