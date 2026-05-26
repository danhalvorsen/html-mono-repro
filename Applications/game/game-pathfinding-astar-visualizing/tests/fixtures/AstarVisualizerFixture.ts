import type {
  AstarEngineStepEvent,
  AstarSettings,
  AstarStats,
  CellState,
  GridDiff,
  GridSnapshot,
} from "../../src/contracts/AstarVisualizerContracts.js";

export class AstarVisualizerFixture {
  public createEmptyCellState(): CellState {
    return {
      role: "empty",
      visitState: "unvisited",
      g: null,
      h: null,
      f: null,
      parentDirection: null,
    };
  }

  public createSnapshot(rows = 3, cols = 3): GridSnapshot {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => this.createEmptyCellState()),
    );
  }

  public createDiff(): GridDiff {
    return [
      {
        row: 1,
        col: 1,
        visitState: "open",
        g: 10,
        h: 20,
        f: 30,
        parentDirection: "north",
      },
    ];
  }

  public createStartedStep(sequence = 1): AstarEngineStepEvent {
    return {
      sequence,
      kind: "started",
      coordinate: null,
      current: null,
      costs: null,
      parent: null,
      path: null,
      evaluatedNodes: 0,
      openSize: 1,
      closedSize: 0,
      elapsedMs: 0,
    };
  }

  public createPathFoundStep(sequence = 10): AstarEngineStepEvent {
    return {
      sequence,
      kind: "path-found",
      coordinate: null,
      current: { row: 2, col: 2 },
      costs: null,
      parent: null,
      path: [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 },
      ],
      evaluatedNodes: 7,
      openSize: 0,
      closedSize: 7,
      elapsedMs: 15,
    };
  }

  public createDefaultSettings(): AstarSettings {
    return {
      heuristic: "manhattan",
      movementMode: "four-way",
      allowCornerCutting: false,
      weight: 1,
    };
  }

  public createIdleStats(): AstarStats {
    return {
      evaluatedNodes: 0,
      openSize: 0,
      closedSize: 0,
      pathLength: null,
      elapsedMs: 0,
      status: "idle",
    };
  }
}
