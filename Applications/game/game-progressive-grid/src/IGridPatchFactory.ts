import type { GridPatchDefinition } from "./GridPatchDefinition.js";
import type { GridPatchResolution } from "./GridPatchResolution.js";
import type { IGridPatch } from "./IGridPatch.js";

export interface IGridPatchFactory {
  create(definition: GridPatchDefinition, resolution: GridPatchResolution): IGridPatch;
}
