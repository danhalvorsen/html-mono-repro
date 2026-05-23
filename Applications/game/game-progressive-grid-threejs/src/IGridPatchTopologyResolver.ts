import type { IGridPatch } from "@monorepo/game-progressive-grid";
import type { GridPatchTopology } from "./GridPatchTopology.js";

export interface IGridPatchTopologyResolver {
  resolve(patch: IGridPatch): GridPatchTopology;
}
