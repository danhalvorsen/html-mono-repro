import { ShapeEdgePoint } from "./types.js";
import type { IPoint2D } from "@monorepo/core-semantic-model";
export interface IEdgePointFactory {
  createPoints(start: IPoint2D, end: IPoint2D): readonly ShapeEdgePoint[];
}
