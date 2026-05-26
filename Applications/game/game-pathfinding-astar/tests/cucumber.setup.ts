import { Before, setWorldConstructor } from "@cucumber/cucumber";
import { AstarPathfinder } from "../src/index.js";
import type {
  AstarMovementMode,
  AstarSearchResult,
  AstarSettings,
  GridCoordinate,
} from "../src/index.js";

export interface AstarWorldState {
  rows: number;
  cols: number;
  start: GridCoordinate | null;
  goal: GridCoordinate | null;
  blocked: Set<string>;
  settings: AstarSettings;
  traversalCostByKey: Map<string, number>;
  randomSeed: number;
  latestResult: AstarSearchResult | null;
  lastError: Error | null;
  executionMs: number;
  repeatedResults: AstarSearchResult[];
  dijkstraEvaluatedNodes: number | null;
  astarEvaluatedNodesForComparison: number | null;
  lastHeuristicFrom: GridCoordinate | null;
  lastHeuristicTo: GridCoordinate | null;
}

const DEFAULT_SETTINGS: AstarSettings = {
  heuristic: "manhattan",
  movementMode: "four-way",
  allowCornerCutting: false,
  weight: 1,
};

function createCellKey(coordinate: GridCoordinate): string {
  return `${coordinate.row},${coordinate.col}`;
}

export class AstarWorld {
  public readonly pathfinder = new AstarPathfinder();

  public state: AstarWorldState = {
    rows: 5,
    cols: 5,
    start: null,
    goal: null,
    blocked: new Set<string>(),
    settings: DEFAULT_SETTINGS,
    traversalCostByKey: new Map<string, number>(),
    randomSeed: 42,
    latestResult: null,
    lastError: null,
    executionMs: 0,
    repeatedResults: [],
    dijkstraEvaluatedNodes: null,
    astarEvaluatedNodesForComparison: null,
    lastHeuristicFrom: null,
    lastHeuristicTo: null,
  };

  public reset(): void {
    this.state = {
      rows: 5,
      cols: 5,
      start: null,
      goal: null,
      blocked: new Set<string>(),
      settings: DEFAULT_SETTINGS,
      traversalCostByKey: new Map<string, number>(),
      randomSeed: 42,
      latestResult: null,
      lastError: null,
      executionMs: 0,
      repeatedResults: [],
      dijkstraEvaluatedNodes: null,
      astarEvaluatedNodesForComparison: null,
      lastHeuristicFrom: null,
      lastHeuristicTo: null,
    };
  }

  public setMovementMode(mode: AstarMovementMode): void {
    this.state.settings = {
      ...this.state.settings,
      movementMode: mode,
    };
  }

  public setCellTraversalCost(coordinate: GridCoordinate, cost: number): void {
    this.state.traversalCostByKey.set(createCellKey(coordinate), cost);
  }

  public traversalCost = (coordinate: GridCoordinate): number => {
    const key = createCellKey(coordinate);
    return this.state.traversalCostByKey.get(key) ?? 1;
  };
}

Before(function (this: AstarWorld) {
  this.reset();
});

setWorldConstructor(AstarWorld);
