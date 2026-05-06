// FILE: packages/core-collision-modules/core-collision-polygons/src/polygon-collision/code/Polygon.ts

import { Vector2 } from '@monorepo/core-math';
 export enum PolygonTopology {
  Open = 'open',
  Closed = 'closed',
}
export class Polygon {
  public readonly points: readonly Vector2[];
  public readonly topology: PolygonTopology;

  private constructor(
    points: readonly Vector2[],
    topology: PolygonTopology
  ) {
    this.points = points.map(point => point.clone());
    this.topology = topology;
  }

  public static open(points: readonly Vector2[]): Polygon {
    if (points.length < 2) {
      throw new RangeError('Open polygon requires at least two points.');
    }

    return new Polygon(points, PolygonTopology.Open);
  }

  public static closed(points: readonly Vector2[]): Polygon {
    if (points.length < 3) {
      throw new RangeError('Closed polygon requires at least three points.');
    }

    return new Polygon(points, PolygonTopology.Closed);
  }
}