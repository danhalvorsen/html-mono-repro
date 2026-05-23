import { GridEdgeSide } from "./GridEdgeSide.js";
import type { GridPatchBounds } from "./GridPatchBounds.js";
import type { GridPoint } from "./GridPoint.js";
import type { IGridPatch } from "./IGridPatch.js";

export class GridPatch implements IGridPatch {
  public readonly id: string;
  public readonly bounds: GridPatchBounds;

  private readonly xSamples: readonly number[];
  private readonly ySamples: readonly number[];
  private readonly points: readonly GridPoint[];

  public constructor(
    id: string,
    bounds: GridPatchBounds,
    xSamples: readonly number[],
    ySamples: readonly number[],
  ) {
    this.id = id;
    this.bounds = bounds;
    this.xSamples = xSamples;
    this.ySamples = ySamples;
    this.points = this.createPoints();
  }

  public getPoints(): readonly GridPoint[] {
    return this.points;
  }

  public getEdgeSamples(side: GridEdgeSide): readonly GridPoint[] {
    switch (side) {
      case GridEdgeSide.Left:
        return Object.freeze(this.ySamples.map((y) => ({ x: this.bounds.x0, y })));

      case GridEdgeSide.Right:
        return Object.freeze(this.ySamples.map((y) => ({ x: this.bounds.x1, y })));

      case GridEdgeSide.Bottom:
        return Object.freeze(this.xSamples.map((x) => ({ x, y: this.bounds.y0 })));

      case GridEdgeSide.Top:
        return Object.freeze(this.xSamples.map((x) => ({ x, y: this.bounds.y1 })));

      default:
        throw new Error(`Unsupported grid edge side: ${String(side)}`);
    }
  }

  private createPoints(): readonly GridPoint[] {
    const points: GridPoint[] = [];

    for (const y of this.ySamples) {
      for (const x of this.xSamples) {
        points.push({ x, y });
      }
    }

    return Object.freeze(points);
  }
}
