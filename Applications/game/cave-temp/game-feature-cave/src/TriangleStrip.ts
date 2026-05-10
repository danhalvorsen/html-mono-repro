import type { Vector2 } from '@monorepo/core-math';
import { Polygon } from './polygon.js';

const X_ALIGNMENT_TOLERANCE = 0.000001;

export class TriangleStrip {
  public constructor(
    private readonly upperPoints: readonly Vector2[],
    private readonly lowerPoints: readonly Vector2[],
  ) {}

  public create(): Polygon {
    this.validate();

    return new Polygon(
      [...this.upperPoints, ...[...this.lowerPoints].reverse()],
      false,
    ).withClosed();
  }

  private validate(): void {
    if (this.upperPoints.length < 2) {
      throw new Error('TriangleStrip requires at least 2 upper points.');
    }

    if (this.upperPoints.length !== this.lowerPoints.length) {
      throw new Error('TriangleStrip upper and lower points must have the same point count.');
    }

    for (let index = 0; index < this.upperPoints.length; index += 1) {
      const upper = this.upperPoints[index];
      const lower = this.lowerPoints[index];

      if (upper === undefined || lower === undefined) {
        throw new Error(`TriangleStrip point pair at index ${index} is missing.`);
      }

      if (Math.abs(upper.x - lower.x) > X_ALIGNMENT_TOLERANCE) {
        throw new Error(`TriangleStrip upper and lower x values must match at index ${index}.`);
      }
    }
  }
}
