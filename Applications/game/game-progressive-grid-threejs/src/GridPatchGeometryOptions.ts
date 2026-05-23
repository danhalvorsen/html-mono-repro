import type { IGridCellTriangulator } from "./IGridCellTriangulator.js";
import type { IGridPointProjector } from "./IGridPointProjector.js";

export type GridPatchGeometryOptions = Readonly<{
  readonly projector?: IGridPointProjector;
  readonly triangulator?: IGridCellTriangulator;
}>;
