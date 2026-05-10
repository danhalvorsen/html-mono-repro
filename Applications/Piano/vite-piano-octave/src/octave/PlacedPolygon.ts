import type { Polygon2D } from "./geometry/Polygon2D";

export interface PlacedPolygon {
  readonly geometry: Polygon2D;
 
  readonly isBlack: boolean;
}
