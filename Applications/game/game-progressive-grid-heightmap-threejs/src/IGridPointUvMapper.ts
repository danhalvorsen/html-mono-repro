import type { GridPointProjectionContext } from "@monorepo/game-progressive-grid-threejs/src/index.js";
import type { UvCoordinate } from "./UvCoordinate.js";

export interface IGridPointUvMapper {
  map(context: GridPointProjectionContext): UvCoordinate;
}
