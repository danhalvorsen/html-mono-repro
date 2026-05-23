import type { GridNeighbour } from "./GridNeighbour.js";
import type { GridPatchDefinition } from "./GridPatchDefinition.js";
import type { GridPatchResolution } from "./GridPatchResolution.js";

export interface IGridResolutionNegotiator {
  negotiate(
    definitions: readonly GridPatchDefinition[],
    neighbours: readonly GridNeighbour[],
  ): ReadonlyMap<string, GridPatchResolution>;
}
