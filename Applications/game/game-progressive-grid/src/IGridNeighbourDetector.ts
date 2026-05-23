import type { GridNeighbour } from "./GridNeighbour.js";
import type { GridPatchDefinition } from "./GridPatchDefinition.js";

export interface IGridNeighbourDetector {
  findNeighbours(definitions: readonly GridPatchDefinition[]): readonly GridNeighbour[];
}
