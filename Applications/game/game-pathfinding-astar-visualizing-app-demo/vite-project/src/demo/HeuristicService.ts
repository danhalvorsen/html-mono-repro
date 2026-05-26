import type { AstarHeuristic, GridCoordinate } from "../../../../game-pathfinding-astar/src/index.ts";

export type HeuristicMode = AstarHeuristic;

export class HeuristicService {
  public static isMode(value: unknown): value is HeuristicMode {
    return (
      value === "manhattan"
      || value === "euclidean"
      || value === "chebyshev"
      || value === "octile"
    );
  }

  public static distance(mode: HeuristicMode, from: GridCoordinate, to: GridCoordinate): number {
    const dx = Math.abs(from.row - to.row);
    const dy = Math.abs(from.col - to.col);

    if (mode === "manhattan") {
      return dx + dy;
    }

    if (mode === "euclidean") {
      return Math.hypot(dx, dy);
    }

    if (mode === "chebyshev") {
      return Math.max(dx, dy);
    }

    return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
  }
}
