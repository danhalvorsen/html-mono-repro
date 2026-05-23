import { Mesh } from "three";
import type { IGridPatch } from "@monorepo/game-progressive-grid";
import { DefaultGridMaterialFactory } from "./DefaultGridMaterialFactory.js";
import type { GridPatchMeshOptions } from "./GridPatchMeshOptions.js";
import type { IGridMaterialFactory } from "./IGridMaterialFactory.js";
import type { IGridPatchGeometryFactory } from "./IGridPatchGeometryFactory.js";
import type { IGridPatchMeshFactory } from "./IGridPatchMeshFactory.js";
import { ThreeGridPatchGeometryFactory } from "./ThreeGridPatchGeometryFactory.js";

export class ThreeGridPatchMeshFactory implements IGridPatchMeshFactory {
  private readonly geometryFactory: IGridPatchGeometryFactory;
  private readonly materialFactory: IGridMaterialFactory;

  public constructor(
    geometryFactory: IGridPatchGeometryFactory = new ThreeGridPatchGeometryFactory(),
    materialFactory: IGridMaterialFactory = new DefaultGridMaterialFactory(),
  ) {
    this.geometryFactory = geometryFactory;
    this.materialFactory = materialFactory;
  }

  public createMesh(patch: IGridPatch, options: GridPatchMeshOptions = {}): Mesh {
    const geometry = this.geometryFactory.createGeometry(patch, options.geometryOptions);
    const material = options.material ?? this.materialFactory.createMaterial(patch);
    const mesh = new Mesh(geometry, material);

    mesh.name = `${options.namePrefix ?? "grid-patch-"}${patch.id}`;

    return mesh;
  }
}
