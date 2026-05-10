import { type BoundingBox2D, type Line, Vector2 } from "@monorepo/core-math";

export class PolygonIntersectionAnalyzer {
  public boundsIntersect(
    source: BoundingBox2D,
    target: BoundingBox2D,
    tolerance: number
  ): boolean {
    return !(
      source.max.x + tolerance < target.min.x ||
      source.min.x - tolerance > target.max.x ||
      source.max.y + tolerance < target.min.y ||
      source.min.y - tolerance > target.max.y
    );
  }

  public tryIntersectAll(
    source: Line<Vector2>,
    target: Line<Vector2>,
    tolerance: number
  ): readonly Vector2[] {
    const p = source.A;
    const q = target.A;
    const r = source.B.subtract(source.A);
    const s = target.B.subtract(target.A);
    const denominator = this.cross(r, s);
    const qMinusP = q.subtract(p);

    if (Math.abs(denominator) <= tolerance) {
      return this.tryGetCollinearOverlapPoints(source, target, tolerance);
    }

    const sourceT = this.cross(qMinusP, s) / denominator;
    const targetT = this.cross(qMinusP, r) / denominator;

    if (!this.isInsideUnitInterval(sourceT, tolerance)) {
      return [];
    }

    if (!this.isInsideUnitInterval(targetT, tolerance)) {
      return [];
    }

    return [source.getPoint(this.clampUnitInterval(sourceT))];
  }

  public isPointOnSegment(
    point: Vector2,
    segment: Line<Vector2>,
    tolerance: number
  ): boolean {
    const ap = point.subtract(segment.A);
    const ab = segment.B.subtract(segment.A);

    if (Math.abs(this.cross(ap, ab)) > tolerance) {
      return false;
    }

    const projection = ap.dot(ab);

    if (projection < -tolerance) {
      return false;
    }

    return projection - ab.dot(ab) <= tolerance;
  }

  private tryGetCollinearOverlapPoints(
    source: Line<Vector2>,
    target: Line<Vector2>,
    tolerance: number
  ): readonly Vector2[] {
    const sourceDirection = source.B.subtract(source.A);
    const targetStartOffset = target.A.subtract(source.A);

    if (Math.abs(this.cross(targetStartOffset, sourceDirection)) > tolerance) {
      return [];
    }

    const sourceLengthSquared = sourceDirection.dot(sourceDirection);

    if (sourceLengthSquared <= tolerance * tolerance) {
      return [];
    }

    const targetStartT =
      target.A.subtract(source.A).dot(sourceDirection) / sourceLengthSquared;

    const targetEndT =
      target.B.subtract(source.A).dot(sourceDirection) / sourceLengthSquared;

    const overlapStart = Math.max(0, Math.min(targetStartT, targetEndT));
    const overlapEnd = Math.min(1, Math.max(targetStartT, targetEndT));

    if (overlapStart - overlapEnd > tolerance) {
      return [];
    }

    const startPoint = source.getPoint(this.clampUnitInterval(overlapStart));
    const endPoint = source.getPoint(this.clampUnitInterval(overlapEnd));

    if (startPoint.equals(endPoint, tolerance)) {
      return [startPoint];
    }

    return [startPoint, endPoint];
  }

  private cross(source: Vector2, target: Vector2): number {
    return source.x * target.y - source.y * target.x;
  }

  private clampUnitInterval(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private isInsideUnitInterval(value: number, tolerance: number): boolean {
    return value >= -tolerance && value <= 1 + tolerance;
  }
}
