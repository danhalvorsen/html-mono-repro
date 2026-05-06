import { Vector2 } from "@monorepo/core-math";
import {
  Polygon,
  PolygonCollisionSystemRoot,
  type PolygonCollisionSystem,
} from "../../src/index.js";

export class PolygonCollisionFixture {
  public readonly sut: PolygonCollisionSystem =
    PolygonCollisionSystemRoot.createDefault();

  public point(x: number, y: number): Vector2 {
    return new Vector2(x, y);
  }

  public openPoly(points: readonly Vector2[]): Polygon {
    return Polygon.open(points);
  }

  public closedPoly(points: readonly Vector2[]): Polygon {
    return Polygon.closed(points);
  }

  public line(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): readonly Vector2[] {
    return [
      this.point(startX, startY),
      this.point(endX, endY),
    ];
  }

  public box(
    originX: number,
    originY: number,
    width: number,
    height: number
  ): readonly Vector2[] {
    return [
      this.point(originX, originY),
      this.point(originX + width, originY),
      this.point(originX + width, originY + height),
      this.point(originX, originY + height),
    ];
  }

  public translate(
    points: readonly Vector2[],
    movement: Vector2
  ): readonly Vector2[] {
    return points.map(
      (point) => new Vector2(point.x + movement.x, point.y + movement.y)
    );
  }
}
