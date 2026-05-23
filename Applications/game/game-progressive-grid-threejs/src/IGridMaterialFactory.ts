import type { Material } from "three";
import type { IGridPatch } from "@monorepo/game-progressive-grid";

export interface IGridMaterialFactory {
  createMaterial(patch: IGridPatch): Material;
}
