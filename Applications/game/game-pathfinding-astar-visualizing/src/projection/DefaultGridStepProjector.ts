import type {
  AstarEngineStepEvent,
  CellVisitState,
  GridCellPatch,
  GridCoordinate,
  GridDiff,
  ParentDirection,
} from "../contracts/AstarVisualizerContracts.js";

export interface IGridStepProjector {
  project(step: AstarEngineStepEvent): GridDiff;
}

export interface IParentDirectionResolver {
  resolve(from: GridCoordinate, parent: GridCoordinate): ParentDirection;
}

export class DefaultParentDirectionResolver implements IParentDirectionResolver {
  public resolve(from: GridCoordinate, parent: GridCoordinate): ParentDirection {
    const rowDelta = parent.row - from.row;
    const colDelta = parent.col - from.col;

    if (rowDelta === -1 && colDelta === 0) {
      return "north";
    }

    if (rowDelta === -1 && colDelta === 1) {
      return "north-east";
    }

    if (rowDelta === 0 && colDelta === 1) {
      return "east";
    }

    if (rowDelta === 1 && colDelta === 1) {
      return "south-east";
    }

    if (rowDelta === 1 && colDelta === 0) {
      return "south";
    }

    if (rowDelta === 1 && colDelta === -1) {
      return "south-west";
    }

    if (rowDelta === 0 && colDelta === -1) {
      return "west";
    }

    if (rowDelta === -1 && colDelta === -1) {
      return "north-west";
    }

    throw new Error("Parent coordinate must be adjacent to the projected coordinate.");
  }
}

export class DefaultGridStepProjector implements IGridStepProjector {
  private readonly parentDirectionResolver: IParentDirectionResolver;

  public constructor(parentDirectionResolver?: IParentDirectionResolver) {
    this.parentDirectionResolver =
      parentDirectionResolver ?? new DefaultParentDirectionResolver();
  }

  public project(step: AstarEngineStepEvent): GridDiff {
    switch (step.kind) {
      case "started":
        return [];

      case "node-opened":
        return this.projectNode(step, "open");

      case "node-closed":
        return this.projectNode(step, "closed");

      case "cost-updated":
        return this.projectNode(step);

      case "path-found":
        return this.projectPathFound(step);

      case "no-path":
        return [];

      default:
        return this.assertNever(step.kind);
    }
  }

  private projectNode(
    step: AstarEngineStepEvent,
    visitState?: CellVisitState,
  ): GridDiff {
    if (step.coordinate === null) {
      return [];
    }

    return [this.createNodePatch(step, visitState)];
  }

  private projectPathFound(step: AstarEngineStepEvent): GridDiff {
    if (step.path === null) {
      return [];
    }

    return step.path.map((coordinate) => ({
      row: coordinate.row,
      col: coordinate.col,
      visitState: "path",
    }));
  }

  private createNodePatch(
    step: AstarEngineStepEvent,
    visitState?: CellVisitState,
  ): GridCellPatch {
    if (step.coordinate === null) {
      throw new Error("Cannot create a node patch without a coordinate.");
    }

    const costPatch =
      step.costs === null
        ? {}
        : {
            g: step.costs.g,
            h: step.costs.h,
            f: step.costs.f,
          };

    const parentPatch =
      step.parent === null
        ? {}
        : {
            parentDirection: this.parentDirectionResolver.resolve(
              step.coordinate,
              step.parent,
            ),
          };

    const visitPatch =
      visitState === undefined
        ? {}
        : {
            visitState,
          };

    return {
      row: step.coordinate.row,
      col: step.coordinate.col,
      ...visitPatch,
      ...costPatch,
      ...parentPatch,
    };
  }

  private assertNever(value: never): never {
    throw new Error(`Unsupported A* engine step kind: ${String(value)}`);
  }
}
