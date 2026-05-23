import { expect } from "vitest";
import {
  GridNeighbourDetector,
  MaxEdgeResolutionNegotiator,
  ProgressiveGridBuilder,
  UniformGridPatchFactory,
  UniformSamplingPolicy,
  type GridEdgeSide,
  type GridPatchDefinition,
  type IGridPatch,
  type IProgressiveGrid,
} from "../../src/index.js";

export class ProgressiveGridFixture {
  public createBuilder(): ProgressiveGridBuilder {
    return new ProgressiveGridBuilder(
      new GridNeighbourDetector(),
      new MaxEdgeResolutionNegotiator(),
      new UniformGridPatchFactory(new UniformSamplingPolicy()),
    );
  }

  public createPatch(
    id: string,
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    xSamples: number,
    ySamples: number,
  ): GridPatchDefinition {
    return {
      id,
      bounds: { x0, x1, y0, y1 },
      resolution: { xSamples, ySamples },
    };
  }

  public getRequiredPatch(grid: IProgressiveGrid, id: string): IGridPatch {
    const patch = grid.getPatch(id);

    if (patch === undefined) {
      throw new Error(`Expected grid patch to exist: ${id}`);
    }

    return patch;
  }

  public expectEdgesToEqual(
    first: IGridPatch,
    firstSide: GridEdgeSide,
    second: IGridPatch,
    secondSide: GridEdgeSide,
  ): void {
    expect(first.getEdgeSamples(firstSide)).toEqual(second.getEdgeSamples(secondSide));
  }
}
