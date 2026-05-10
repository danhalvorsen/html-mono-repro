import type { Vector2 } from "@monorepo/core-math";
import { PolygonTopology, type Polygon } from "./Polygon.js";

export class PolygonCollisionValidator {
  public validate(source: Polygon, target: Polygon, tolerance: number): void {
    this.assertTolerance(tolerance);
    this.assertPolygon(source, "source");
    this.assertPolygon(target, "target");
  }

  private assertTolerance(tolerance: number): void {
    if (!Number.isFinite(tolerance) || tolerance < 0) {
      throw new RangeError(
        "Polygon collision tolerance must be a finite number greater than or equal to zero."
      );
    }
  }

  private assertPolygon(polygon: Polygon, name: string): void {
    if (polygon.topology === PolygonTopology.Closed && polygon.points.length < 3) {
      throw new RangeError(
        `${name}.polygon closed topology requires at least three points.`
      );
    }

    for (let index = 0; index < polygon.points.length; index++) {
      const point = this.getPointAt(polygon.points, index, `${name}.points`);

      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        throw new RangeError(
          `${name}.points[${index}] must contain finite x and y values.`
        );
      }
    }
  }

  private getPointAt(points: readonly Vector2[], index: number, label: string): Vector2 {
    const point = points[index];

    if (!point) {
      throw new RangeError(`${label}[${index}] is missing.`);
    }

    return point;
  }
}
