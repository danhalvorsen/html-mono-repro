import type { Polygon } from "@monorepo/game-primetives";

export interface IPolygonBooleanOperations {
  compose(
    polygons: readonly Polygon[],
  ): Polygon;

  union(
    subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[];

  difference(
    subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[];

  intersect(
    subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[];

  xor(
    subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[];
}
