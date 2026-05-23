import {
  GridPatch,
  ProgressiveGrid,
  type GridNeighbour,
  type IGridPatch,
  type IProgressiveGrid,
} from "@monorepo/game-progressive-grid";

export class ThreeGridFixture {
  public createPatch(
    id: string,
    xSamples: readonly number[] = [0, 1],
    ySamples: readonly number[] = [0, 1],
  ): IGridPatch {
    return new GridPatch(
      id,
      {
        x0: xSamples[0] ?? 0,
        x1: xSamples[xSamples.length - 1] ?? 1,
        y0: ySamples[0] ?? 0,
        y1: ySamples[ySamples.length - 1] ?? 1,
      },
      xSamples,
      ySamples,
    );
  }

  public createGrid(
    patches: readonly IGridPatch[],
    neighbours: readonly GridNeighbour[] = [],
  ): IProgressiveGrid {
    return new ProgressiveGrid(patches, neighbours);
  }
}
