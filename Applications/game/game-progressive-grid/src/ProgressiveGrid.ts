import type { GridNeighbour } from "./GridNeighbour.js";
import type { IGridPatch } from "./IGridPatch.js";
import type { IProgressiveGrid } from "./IProgressiveGrid.js";

export class ProgressiveGrid implements IProgressiveGrid {
  private readonly patchesById: ReadonlyMap<string, IGridPatch>;
  private readonly neighbours: readonly GridNeighbour[];

  public constructor(patches: readonly IGridPatch[], neighbours: readonly GridNeighbour[]) {
    this.patchesById = this.createPatchMap(patches);
    this.neighbours = Object.freeze([...neighbours]);
  }

  public getPatches(): readonly IGridPatch[] {
    return Object.freeze(Array.from(this.patchesById.values()));
  }

  public getPatch(id: string): IGridPatch | undefined {
    return this.patchesById.get(id);
  }

  public getNeighbours(): readonly GridNeighbour[] {
    return this.neighbours;
  }

  private createPatchMap(patches: readonly IGridPatch[]): ReadonlyMap<string, IGridPatch> {
    const patchesById = new Map<string, IGridPatch>();

    for (const patch of patches) {
      if (patchesById.has(patch.id)) {
        throw new Error(`Duplicate grid patch id: ${patch.id}`);
      }

      patchesById.set(patch.id, patch);
    }

    return patchesById;
  }
}
