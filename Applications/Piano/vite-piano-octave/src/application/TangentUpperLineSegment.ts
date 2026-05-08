import type { Point } from "../types";

export type TangentUpperLineSegment = {
  readonly start: Point;
  readonly end: Point;
  readonly minX: number;
  readonly maxX: number;
  readonly y: number;
  readonly length: number;
};

export interface ITangentUpperLineSegmentReader {
  read(points: readonly Point[]): TangentUpperLineSegment | null;
}

export class DefaultTangentUpperLineSegmentReader
  implements ITangentUpperLineSegmentReader
{
  private static readonly EPSILON = 0.000001;

  public read(points: readonly Point[]): TangentUpperLineSegment | null {
    if (points.length < 2) {
      return null;
    }

    const maxY = Math.max(...points.map(([, y]) => y));
    let bestSegment: TangentUpperLineSegment | null = null;

    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];

      if (current === undefined || next === undefined) {
        continue;
      }

      if (!this.isUpperHorizontalSegment(current, next, maxY)) {
        continue;
      }

      const minX = Math.min(current[0], next[0]);
      const maxX = Math.max(current[0], next[0]);
      const length = maxX - minX;

      if (length <= 0) {
        continue;
      }

      if (bestSegment === null || length > bestSegment.length) {
        bestSegment = {
          start: current,
          end: next,
          minX,
          maxX,
          y: maxY,
          length
        };
      }
    }

    return bestSegment;
  }

  private isUpperHorizontalSegment(
    current: Point,
    next: Point,
    maxY: number
  ): boolean {
    return (
      Math.abs(current[1] - maxY) <= DefaultTangentUpperLineSegmentReader.EPSILON &&
      Math.abs(next[1] - maxY) <= DefaultTangentUpperLineSegmentReader.EPSILON
    );
  }
}