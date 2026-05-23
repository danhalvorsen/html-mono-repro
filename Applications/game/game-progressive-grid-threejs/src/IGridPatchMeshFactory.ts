import type { Mesh } from "three";
import type { IGridPatch } from "@monorepo/game-progressive-grid";
import type { GridPatchMeshOptions } from "./GridPatchMeshOptions.js";

export interface IGridPatchMeshFactory {
  createMesh(patch: IGridPatch, options?: GridPatchMeshOptions): Mesh;
}
