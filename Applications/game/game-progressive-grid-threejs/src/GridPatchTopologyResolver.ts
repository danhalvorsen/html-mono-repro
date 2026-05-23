import type { GridPoint, IGridPatch } from "@monorepo/game-progressive-grid";
import { GridPatchTopology } from "./GridPatchTopology.js";
import type { IGridPatchTopologyResolver } from "./IGridPatchTopologyResolver.js";

export class GridPatchTopologyResolver implements IGridPatchTopologyResolver {
  private readonly decimals: number;

  public constructor(decimals = 10) {
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 15) {
      throw new Error("Topology resolver decimals must be an integer between 0 and 15.");
    }

    this.decimals = decimals;
  }

  public resolve(patch: IGridPatch): GridPatchTopology {
    const sourcePoints = patch.getPoints();

    if (sourcePoints.length === 0) {
      throw new Error(`Grid patch contains no points: ${patch.id}`);
    }

    const xValues = this.getSortedUniqueValues(sourcePoints.map((point) => point.x));
    const yValues = this.getSortedUniqueValues(sourcePoints.map((point) => point.y));

    if (xValues.length < 2 || yValues.length < 2) {
      throw new Error(`Grid patch must contain at least one cell: ${patch.id}`);
    }

    const pointByKey = this.createPointMap(sourcePoints, patch.id);
    const orderedPoints: GridPoint[] = [];

    for (const y of yValues) {
      for (const x of xValues) {
        const point = pointByKey.get(this.createPointKey(x, y));

        if (point === undefined) {
          throw new Error(`Grid patch is not rectangular: ${patch.id}`);
        }

        orderedPoints.push(point);
      }
    }

    return new GridPatchTopology(xValues.length, yValues.length, orderedPoints);
  }

  private createPointMap(
    points: readonly GridPoint[],
    patchId: string,
  ): ReadonlyMap<string, GridPoint> {
    const pointByKey = new Map<string, GridPoint>();

    for (const point of points) {
      const key = this.createPointKey(point.x, point.y);

      if (pointByKey.has(key)) {
        throw new Error(`Grid patch contains duplicate points: ${patchId}`);
      }

      pointByKey.set(key, point);
    }

    return pointByKey;
  }

  private getSortedUniqueValues(values: readonly number[]): readonly number[] {
    const valueByKey = new Map<string, number>();

    for (const value of values) {
      if (!Number.isFinite(value)) {
        throw new Error("Grid point coordinates must be finite.");
      }

      valueByKey.set(this.normalize(value), value);
    }

    return Object.freeze(
      Array.from(valueByKey.values()).sort((first, second) => first - second),
    );
  }

  private createPointKey(x: number, y: number): string {
    return `${this.normalize(x)}:${this.normalize(y)}`;
  }

  private normalize(value: number): string {
    return value.toFixed(this.decimals);
  }
}
