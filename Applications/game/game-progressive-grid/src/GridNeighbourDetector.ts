import type { GridNeighbour } from "./GridNeighbour.js";
import type { GridPatchBounds } from "./GridPatchBounds.js";
import type { GridPatchDefinition } from "./GridPatchDefinition.js";
import type { IGridNeighbourDetector } from "./IGridNeighbourDetector.js";
import { SharedEdgeOrientation } from "./SharedEdgeOrientation.js";

export class GridNeighbourDetector implements IGridNeighbourDetector {
  private readonly tolerance: number;

  public constructor(tolerance = 1e-9) {
    if (!Number.isFinite(tolerance) || tolerance < 0) {
      throw new Error("Neighbour detector tolerance must be a finite non-negative number.");
    }

    this.tolerance = tolerance;
  }

  public findNeighbours(definitions: readonly GridPatchDefinition[]): readonly GridNeighbour[] {
    const neighbours: GridNeighbour[] = [];

    for (const [firstIndex, first] of definitions.entries()) {
      for (const [secondIndex, second] of definitions.entries()) {
        if (secondIndex <= firstIndex) {
          continue;
        }

        const vertical = this.tryCreateVerticalNeighbour(first, second);

        if (vertical !== undefined) {
          neighbours.push(vertical);
          continue;
        }

        const horizontal = this.tryCreateHorizontalNeighbour(first, second);

        if (horizontal !== undefined) {
          neighbours.push(horizontal);
        }
      }
    }

    return Object.freeze(neighbours);
  }

  private tryCreateVerticalNeighbour(
    first: GridPatchDefinition,
    second: GridPatchDefinition,
  ): GridNeighbour | undefined {
    if (this.isLeftOf(first.bounds, second.bounds)) {
      return {
        firstPatchId: first.id,
        secondPatchId: second.id,
        orientation: SharedEdgeOrientation.Vertical,
      };
    }

    if (this.isLeftOf(second.bounds, first.bounds)) {
      return {
        firstPatchId: second.id,
        secondPatchId: first.id,
        orientation: SharedEdgeOrientation.Vertical,
      };
    }

    return undefined;
  }

  private tryCreateHorizontalNeighbour(
    first: GridPatchDefinition,
    second: GridPatchDefinition,
  ): GridNeighbour | undefined {
    if (this.isBelow(first.bounds, second.bounds)) {
      return {
        firstPatchId: first.id,
        secondPatchId: second.id,
        orientation: SharedEdgeOrientation.Horizontal,
      };
    }

    if (this.isBelow(second.bounds, first.bounds)) {
      return {
        firstPatchId: second.id,
        secondPatchId: first.id,
        orientation: SharedEdgeOrientation.Horizontal,
      };
    }

    return undefined;
  }

  private isLeftOf(left: GridPatchBounds, right: GridPatchBounds): boolean {
    return (
      this.same(left.x1, right.x0) &&
      this.same(left.y0, right.y0) &&
      this.same(left.y1, right.y1)
    );
  }

  private isBelow(bottom: GridPatchBounds, top: GridPatchBounds): boolean {
    return (
      this.same(bottom.y1, top.y0) &&
      this.same(bottom.x0, top.x0) &&
      this.same(bottom.x1, top.x1)
    );
  }

  private same(first: number, second: number): boolean {
    return Math.abs(first - second) <= this.tolerance;
  }
}
