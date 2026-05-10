import { BoundingBox2D, Line, Vector2 } from "@monorepo/core-math";
import { type CollisionReference, CollisionReferenceKind } from "./PolygonCollisionContracts.js";
import { Polygon, PolygonTopology } from "./Polygon.js";
import { PolygonSegment } from "./PolygonSegment.js";

export class PolygonSegmentFactory {
  public createSegments(polygon: Polygon, tolerance: number): readonly PolygonSegment[] {
    const points = polygon.points;

    if (points.length < 2) {
      return [];
    }

    const segmentCount =
      polygon.topology === PolygonTopology.Closed
        ? points.length
        : points.length - 1;

    const segments: PolygonSegment[] = [];

    for (let index = 0; index < segmentCount; index++) {
      const nextIndex = (index + 1) % points.length;
      const a = this.getPointAt(points, index, "polygon.points");
      const b = this.getPointAt(points, nextIndex, "polygon.points");

      if (a.distanceTo(b) <= tolerance) {
        continue;
      }

      const line = new Line<Vector2>(a, b);
      segments.push(
        new PolygonSegment(index, line, this.createBounds(line, tolerance))
      );
    }

    return segments;
  }

  public findClosestBoundary(
    point: Vector2,
    polygon: Polygon,
    tolerance: number
  ): CollisionReference {
    const segments = this.createSegments(polygon, tolerance);

    let bestIndex: number | null = null;
    let bestPosition: Vector2 | null = null;
    let bestDistanceSquared = Number.POSITIVE_INFINITY;

    for (const segment of segments) {
      const closest = segment.line.closestPointTo(point);
      const delta = closest.subtract(point);
      const distanceSquared = delta.dot(delta);

      if (distanceSquared >= bestDistanceSquared) {
        continue;
      }

      bestDistanceSquared = distanceSquared;
      bestIndex = segment.index;
      bestPosition = closest;
    }

    if (bestIndex === null || bestPosition === null) {
      return {
        index: null,
        position: null,
        kind: CollisionReferenceKind.None,
      };
    }

    return {
      index: bestIndex,
      position: bestPosition,
      kind: CollisionReferenceKind.Segment,
    };
  }

  private createBounds(line: Line<Vector2>, tolerance: number): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(
        Math.min(line.A.x, line.B.x) - tolerance,
        Math.min(line.A.y, line.B.y) - tolerance
      ),
      new Vector2(
        Math.max(line.A.x, line.B.x) + tolerance,
        Math.max(line.A.y, line.B.y) + tolerance
      )
    );
  }

  private getPointAt(points: readonly Vector2[], index: number, label: string): Vector2 {
    const point = points[index];

    if (!point) {
      throw new RangeError(`${label}[${index}] is missing.`);
    }

    return point;
  }
}
