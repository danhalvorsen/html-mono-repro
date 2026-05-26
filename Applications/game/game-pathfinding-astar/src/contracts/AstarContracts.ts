export type GridRow = number;
export type GridCol = number;

export interface GridCoordinate {
  readonly row: GridRow;
  readonly col: GridCol;
}

export type AstarHeuristic =
  | "manhattan"
  | "euclidean"
  | "octile"
  | "chebyshev";

export type AstarMovementMode =
  | "four-way"
  | "eight-way";

export interface AstarSettings {
  readonly heuristic: AstarHeuristic;
  readonly movementMode: AstarMovementMode;
  readonly allowCornerCutting: boolean;
  readonly weight: number;
}

export interface AstarSearchRequest {
  readonly rows: number;
  readonly cols: number;
  readonly start: GridCoordinate;
  readonly goal: GridCoordinate;
  readonly blocked: ReadonlySet<string>;
  readonly settings: AstarSettings;
  readonly traversalCost?: (coordinate: GridCoordinate) => number;
  readonly maxIterations?: number;
  readonly abortSignal?: AbortSignal;
}

export type AstarTerminationReason =
  | "exhausted-open-set"
  | "iteration-limit"
  | "aborted";

export interface AstarSearchSuccess {
  readonly kind: "path-found";
  readonly path: ReadonlyArray<GridCoordinate>;
  readonly totalCost: number;
  readonly evaluatedNodes: number;
}

export interface AstarSearchFailure {
  readonly kind: "no-path";
  readonly path: null;
  readonly totalCost: null;
  readonly evaluatedNodes: number;
  readonly reason?: AstarTerminationReason;
}

export type AstarSearchResult = AstarSearchSuccess | AstarSearchFailure;

export interface AstarDiagnostics {
  readonly evaluatedNodes: number;
}

export type AstarStepKind =
  | "started"
  | "node-opened"
  | "node-closed"
  | "cost-updated"
  | "path-found"
  | "no-path";

export interface AstarStepEvent {
  readonly sequence: number;
  readonly kind: AstarStepKind;
  readonly coordinate: GridCoordinate | null;
  readonly current: GridCoordinate | null;
  readonly costs: {
    readonly g: number;
    readonly h: number;
    readonly f: number;
  } | null;
  readonly parent: GridCoordinate | null;
  readonly path: ReadonlyArray<GridCoordinate> | null;
  readonly openSize: number;
  readonly closedSize: number;
  readonly elapsedMs: number;
}

export interface IAstarStepper {
  step(): AstarStepEvent | null;
  runToCompletion(): AstarSearchResult;
}

export interface IAstarPathfinder {
  findPath(request: AstarSearchRequest): AstarSearchResult;
}
