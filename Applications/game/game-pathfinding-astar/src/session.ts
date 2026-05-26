import { AstarPathfinder } from "./application/AstarPathfinder.js";
import type {
  AstarSearchRequest,
  AstarSearchResult,
  AstarSettings,
  GridCoordinate,
} from "./contracts/AstarContracts.js";

interface IAstarSession {
  setStart(start: GridCoordinate): void;
  setGoal(goal: GridCoordinate): void;
  setBlocked(blocked: ReadonlySet<string>): void;
  search(): AstarSearchResult;
}

class AstarSession implements IAstarSession {
  private readonly pathfinder = new AstarPathfinder();
  private request: AstarSearchRequest;

  public constructor(initial?: Partial<AstarSearchRequest>) {
    const defaultSettings: AstarSettings = {
      heuristic: "manhattan",
      movementMode: "four-way",
      allowCornerCutting: false,
      weight: 1,
    };

    this.request = {
      rows: initial?.rows ?? 10,
      cols: initial?.cols ?? 10,
      start: initial?.start ?? { row: 0, col: 0 },
      goal: initial?.goal ?? { row: 9, col: 9 },
      blocked: initial?.blocked ?? new Set<string>(),
      settings: initial?.settings ?? defaultSettings,
      ...(initial?.traversalCost === undefined
        ? {}
        : { traversalCost: initial.traversalCost }),
      ...(initial?.maxIterations === undefined
        ? {}
        : { maxIterations: initial.maxIterations }),
      ...(initial?.abortSignal === undefined
        ? {}
        : { abortSignal: initial.abortSignal }),
    };
  }

  public setStart(start: GridCoordinate): void {
    this.request = { ...this.request, start };
  }

  public setGoal(goal: GridCoordinate): void {
    this.request = { ...this.request, goal };
  }

  public setBlocked(blocked: ReadonlySet<string>): void {
    this.request = { ...this.request, blocked };
  }

  public search(): AstarSearchResult {
    return this.pathfinder.findPath(this.request);
  }
}

export function createSession(initial?: Partial<AstarSearchRequest>): IAstarSession {
  return new AstarSession(initial);
}
