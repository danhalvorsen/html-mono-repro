import { Line, Vector2 } from "@monorepo/core-math";
import { type CollisionReference, CollisionReferenceKind } from "./PolygonCollisionContracts.js";
import { Polygon, PolygonTopology } from "./Polygon.js";
import { PolygonIntersectionAnalyzer } from "./PolygonIntersectionAnalyzer.js";
import { PolygonSegmentFactory } from "./PolygonSegmentFactory.js";

export interface ContainmentMatch {
  readonly innerPoint: CollisionReference;
  readonly outerBoundary: CollisionReference;
}

export class PolygonContainmentAnalyzer {
  private readonly segmentFactory: PolygonSegmentFactory;
  private readonly intersectionAnalyzer: PolygonIntersectionAnalyzer;

  public constructor(
    segmentFactory: PolygonSegmentFactory,
    intersectionAnalyzer: PolygonIntersectionAnalyzer
  ) {
    this.segmentFactory = segmentFactory;
    this.intersectionAnalyzer = intersectionAnalyzer;
  }

  public findFirstPointInside(
    inner: Polygon,
    outer: Polygon,
    tolerance: number
  ): ContainmentMatch | null {
    if (outer.topology !== PolygonTopology.Closed) {
      return null;
    }

    for (let index = 0; index < inner.points.length; index++) {
      const point = this.getPointAt(inner.points, index, "inner.points");

      if (!this.isPointInsideClosedPolygon(point, outer, tolerance)) {
        continue;
      }

      return {
        innerPoint: {
          index,
          position: point,
          kind: CollisionReferenceKind.Point,
        },
        outerBoundary: this.segmentFactory.findClosestBoundary(point, outer, tolerance),
      };
    }

    return null;
  }

  public isPointInsideClosedPolygon(
    point: Vector2,
    polygon: Polygon,
    tolerance: number
  ): boolean {
    if (polygon.topology !== PolygonTopology.Closed) {
      return false;
    }

    const points = polygon.points;
    let isInside = false;

    for (
      let index = 0, previousIndex = points.length - 1;
      index < points.length;
      previousIndex = index++
    ) {
      const a = this.getPointAt(points, previousIndex, "polygon.points");
      const b = this.getPointAt(points, index, "polygon.points");
      const segment = new Line<Vector2>(a, b);

      if (this.intersectionAnalyzer.isPointOnSegment(point, segment, tolerance)) {
        return true;
      }

      const crossesHorizontalRay = (a.y > point.y) !== (b.y > point.y);

      if (!crossesHorizontalRay) {
        continue;
      }

      const rayIntersectionX =
        ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;

      if (point.x <= rayIntersectionX + tolerance) {
        isInside = !isInside;
      }
    }

    return isInside;
  }

  private getPointAt(points: readonly Vector2[], index: number, label: string): Vector2 {
    const point = points[index];

    if (!point) {
      throw new RangeError(`${label}[${index}] is missing.`);
    }

    return point;
  }
}
