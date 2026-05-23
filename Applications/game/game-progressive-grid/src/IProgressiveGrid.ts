import type { GridNeighbour } from "./GridNeighbour.js";
import type { IGridPatch } from "./IGridPatch.js";

export interface IProgressiveGrid {
  getPatches(): readonly IGridPatch[];

  getPatch(id: string): IGridPatch | undefined;

  getNeighbours(): readonly GridNeighbour[];
}
