import type { Vector3 } from "three";
import type { GridPointProjectionContext } from "./GridPointProjectionContext.js";

export interface IGridPointProjector {
  project(context: GridPointProjectionContext): Vector3;
}
