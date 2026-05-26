import type {
  AstarSearchRequest,
  GridCoordinate,
} from "../../../../game-pathfinding-astar/src/index.ts";
import type {
  CellState,
  GridSnapshot,
} from "../../../../game-pathfinding-astar-visualizing/src/contracts/AstarVisualizerContracts.ts";
import { createEmptyGridSnapshot } from "../../../../game-pathfinding-astar-visualizing/src/contracts/AstarVisualizerContracts.ts";
import type { HeuristicMode } from "./HeuristicService.ts";

export class SnapshotMapper {
  public createDemoSnapshot(rows: number, cols: number): GridSnapshot {
    const snapshot = createEmptyGridSnapshot(rows, cols).map((row) => row.map((cell) => ({ ...cell })));

    snapshot[1]![1] = { ...snapshot[1]![1], role: "start" };
    snapshot[rows - 2]![cols - 2] = { ...snapshot[rows - 2]![cols - 2], role: "goal" };

    for (let col = 2; col < cols - 2; col += 1) {
      if (col === Math.floor(cols / 2)) {
        continue;
      }

      snapshot[4]![col] = { ...snapshot[4]![col], role: "wall" };
    }

    return snapshot;
  }

  public snapshotToRequest(snapshot: GridSnapshot, heuristic: HeuristicMode): AstarSearchRequest {
    const rows = snapshot.length;
    const cols = snapshot[0]?.length ?? 0;

    const start = this.findCell(snapshot, "start") ?? { row: 0, col: 0 };
    const goal = this.findCell(snapshot, "goal") ?? { row: rows - 1, col: cols - 1 };

    return {
      rows,
      cols,
      start,
      goal,
      blocked: this.collectBlocked(snapshot),
      traversalCost: (coordinate) => this.getTraversalCost(snapshot, coordinate),
      settings: {
        heuristic,
        movementMode: "four-way",
        allowCornerCutting: false,
        weight: 1,
      },
    };
  }

  public requestToSnapshot(request: AstarSearchRequest): GridSnapshot {
    const snapshot = createEmptyGridSnapshot(request.rows, request.cols).map((row) => row.map((cell) => ({ ...cell })));

    snapshot[request.start.row]![request.start.col] = {
      ...snapshot[request.start.row]![request.start.col],
      role: "start",
    };

    snapshot[request.goal.row]![request.goal.col] = {
      ...snapshot[request.goal.row]![request.goal.col],
      role: "goal",
    };

    for (const blockedKey of request.blocked) {
      const [rowText, colText] = blockedKey.split(",");
      const row = Number(rowText);
      const col = Number(colText);

      if (
        Number.isInteger(row)
        && Number.isInteger(col)
        && row >= 0
        && col >= 0
        && row < request.rows
        && col < request.cols
        && !(row === request.start.row && col === request.start.col)
        && !(row === request.goal.row && col === request.goal.col)
      ) {
        snapshot[row]![col] = {
          ...snapshot[row]![col],
          role: "wall",
        };
      }
    }

    return snapshot;
  }

  public clone(snapshot: GridSnapshot): CellState[][] {
    return snapshot.map((row) => row.map((cell) => ({ ...cell })));
  }

  public clearProgress(snapshot: GridSnapshot): GridSnapshot {
    return snapshot.map((row) =>
      row.map((cell) => ({
        ...cell,
        visitState: "unvisited",
        g: cell.role === "wall" ? cell.g : null,
        h: cell.role === "wall" ? cell.h : null,
        f: cell.role === "wall" ? cell.f : null,
        parentDirection: null,
      })),
    );
  }

  public findCell(snapshot: GridSnapshot, role: "start" | "goal"): GridCoordinate | null {
    for (let row = 0; row < snapshot.length; row += 1) {
      const cells = snapshot[row] ?? [];
      for (let col = 0; col < cells.length; col += 1) {
        if (cells[col]?.role === role) {
          return { row, col };
        }
      }
    }

    return null;
  }

  private collectBlocked(snapshot: GridSnapshot): ReadonlySet<string> {
    const blocked = new Set<string>();

    for (let row = 0; row < snapshot.length; row += 1) {
      const cells = snapshot[row] ?? [];
      for (let col = 0; col < cells.length; col += 1) {
        const cell = cells[col];
        const isHardWall = cell?.role === "wall" && cell.g === null;

        if (isHardWall) {
          blocked.add(`${row},${col}`);
        }
      }
    }

    return blocked;
  }

  public getTraversalCost(snapshot: GridSnapshot, coordinate: GridCoordinate): number {
    const cell = snapshot[coordinate.row]?.[coordinate.col];
    if (cell === undefined) {
      return 1;
    }

    if (cell.role !== "wall") {
      return 1;
    }

    if (cell.g === 25) {
      return 1.25;
    }

    if (cell.g === 50) {
      return 1.5;
    }

    if (cell.g === 75) {
      return 1.75;
    }

    if (cell.g === 100) {
      return 2;
    }

    return 1;
  }

  public toggleWall(snapshot: GridSnapshot, row: number, col: number): GridSnapshot {
    const mutable = this.clone(snapshot);
    const cell = mutable[row]?.[col];

    if (cell === undefined || cell.role === "start" || cell.role === "goal") {
      return snapshot;
    }

    mutable[row]![col] = {
      ...cell,
      role: cell.role === "wall" ? "empty" : "wall",
      visitState: "unvisited",
      g: null,
      h: null,
      f: null,
      parentDirection: null,
    };

    return mutable;
  }

  public applyObstacleType(
    snapshot: GridSnapshot,
    row: number,
    col: number,
    obstacleType: string,
  ): GridSnapshot {
    const mutable = this.clone(snapshot);
    const cell = mutable[row]?.[col];

    if (cell === undefined || cell.role === "start" || cell.role === "goal") {
      return snapshot;
    }

    if (obstacleType === "start" || obstacleType === "goal") {
      for (let r = 0; r < mutable.length; r += 1) {
        const rowCells = mutable[r] ?? [];
        for (let c = 0; c < rowCells.length; c += 1) {
          if (rowCells[c]?.role === obstacleType) {
            mutable[r]![c] = {
              ...rowCells[c],
              role: "empty",
              visitState: "unvisited",
              g: null,
              h: null,
              f: null,
              parentDirection: null,
            };
          }
        }
      }
    }

    const isWeightedWall = obstacleType.startsWith("wall-");
    const wallCost = isWeightedWall ? Number(obstacleType.slice(5)) : null;

    const nextRole =
      obstacleType === "start" || obstacleType === "goal" || isWeightedWall
        ? (obstacleType.startsWith("wall") ? "wall" : obstacleType)
        : "empty";

    mutable[row]![col] = {
      ...cell,
      role: nextRole,
      visitState: "unvisited",
      g: wallCost,
      h: wallCost,
      f: wallCost,
      parentDirection: null,
    };

    return mutable;
  }

  public applyPathStep(
    snapshot: GridSnapshot,
    coordinate: GridCoordinate,
    g: number,
    h: number,
  ): GridSnapshot {
    const mutable = this.clone(snapshot);
    const cell = mutable[coordinate.row]?.[coordinate.col];

    if (cell === undefined || cell.role === "start" || cell.role === "goal") {
      return snapshot;
    }

    mutable[coordinate.row]![coordinate.col] = {
      ...cell,
      visitState: "path",
      g,
      h,
      f: g + h,
    };

    return mutable;
  }
}
