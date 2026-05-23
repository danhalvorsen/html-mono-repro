import { Group } from "three";
import type { IProgressiveGrid } from "@monorepo/game-progressive-grid";
import type { IGridPatchMeshFactory } from "./IGridPatchMeshFactory.js";
import type { IProgressiveGridGroupFactory } from "./IProgressiveGridGroupFactory.js";
import type { ProgressiveGridGroupOptions } from "./ProgressiveGridGroupOptions.js";
import { ThreeGridPatchMeshFactory } from "./ThreeGridPatchMeshFactory.js";

export class ThreeProgressiveGridGroupFactory implements IProgressiveGridGroupFactory {
  private readonly patchMeshFactory: IGridPatchMeshFactory;

  public constructor(
    patchMeshFactory: IGridPatchMeshFactory = new ThreeGridPatchMeshFactory(),
  ) {
    this.patchMeshFactory = patchMeshFactory;
  }

  public createGroup(
    grid: IProgressiveGrid,
    options: ProgressiveGridGroupOptions = {},
  ): Group {
    const group = new Group();
    group.name = options.name ?? "progressive-grid";

    for (const patch of grid.getPatches()) {
      group.add(this.patchMeshFactory.createMesh(patch, options.patchMeshOptions));
    }

    return group;
  }
}
