import type { Vector2 } from '@monorepo/core-math';

export class ReferenceCurve {
  private readonly pointsValue: readonly Vector2[];

  public constructor(points: readonly Vector2[]) {
    if (points.length < 2) {
      throw new Error('ReferenceCurve requires at least 2 points.');
    }

    this.pointsValue = Object.freeze([...points]);
  }

  public get points(): readonly Vector2[] {
    return this.pointsValue;
  }

  public getStartPoint(): Vector2 {
    return this.getPoint(0);
  }

  public getCenterPoint(): Vector2 {
    return this.getPoint(Math.floor(this.pointsValue.length / 2));
  }

  public findNearestPointByX(x: number): Vector2 {
    if (!Number.isFinite(x)) {
      throw new RangeError('x must be finite.');
    }

    let nearest = this.getPoint(0);
    let nearestDistance = Math.abs(nearest.x - x);

    for (const point of this.pointsValue) {
      const distance = Math.abs(point.x - x);

      if (distance >= nearestDistance) {
        continue;
      }

      nearest = point;
      nearestDistance = distance;
    }

    return nearest;
  }

  private getPoint(index: number): Vector2 {
    const point = this.pointsValue[index];

    if (point === undefined) {
      throw new Error(`ReferenceCurve point index ${index} is out of range.`);
    }

    return point;
  }
}
