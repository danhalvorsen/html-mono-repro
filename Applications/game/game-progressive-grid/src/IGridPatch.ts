import type { GridEdgeSide } from "./GridEdgeSide.js";
import type { GridPatchBounds } from "./GridPatchBounds.js";
import type { GridPoint } from "./GridPoint.js";

export interface IGridPatch {
  readonly id: string;
  readonly bounds: GridPatchBounds;

  getPoints(): readonly GridPoint[];

  getEdgeSamples(side: GridEdgeSide): readonly GridPoint[];
}
