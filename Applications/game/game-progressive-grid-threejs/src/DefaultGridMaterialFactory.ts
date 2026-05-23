import { MeshBasicMaterial } from "three";
import type { Material } from "three";
import type { IGridPatch } from "@monorepo/game-progressive-grid";
import type { IGridMaterialFactory } from "./IGridMaterialFactory.js";

export class DefaultGridMaterialFactory implements IGridMaterialFactory {
  public createMaterial(_patch: IGridPatch): Material {
    return new MeshBasicMaterial({
      wireframe: true,
    });
  }
}
