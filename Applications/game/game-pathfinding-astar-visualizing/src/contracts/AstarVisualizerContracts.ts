export type GridRow = number;
export type GridCol = number;

export interface GridCoordinate {
  readonly row: GridRow;
  readonly col: GridCol;
}

export type CellRole = "empty" | "start" | "goal" | "wall";

export type CellVisitState =
  | "unvisited"
  | "open"
  | "closed"
  | "current"
  | "path";

export type ParentDirection =
  | "north"
  | "north-east"
  | "east"
  | "south-east"
  | "south"
  | "south-west"
  | "west"
  | "north-west";

export interface CellState {
  readonly role: CellRole;
  readonly visitState: CellVisitState;
  readonly g: number | null;
  readonly h: number | null;
  readonly f: number | null;
  readonly parentDirection: ParentDirection | null;
}

export type GridSnapshot = ReadonlyArray<ReadonlyArray<CellState>>;

export interface GridCellPatch {
  readonly row: GridRow;
  readonly col: GridCol;
  readonly role?: CellRole;
  readonly visitState?: CellVisitState;
  readonly g?: number | null;
  readonly h?: number | null;
  readonly f?: number | null;
  readonly parentDirection?: ParentDirection | null;
}

export type GridDiff = ReadonlyArray<GridCellPatch>;

export type PlacementMode = "start" | "goal" | "wall" | "erase";

export type DragPhase = "start" | "move" | "end";

export type AstarStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export interface AstarStats {
  readonly evaluatedNodes: number;
  readonly openSize: number;
  readonly closedSize: number;
  readonly pathLength: number | null;
  readonly elapsedMs: number;
  readonly status: AstarStatus;
}

export type AstarHeuristic =
  | "manhattan"
  | "euclidean"
  | "octile"
  | "chebyshev";

export type AstarMovementMode = "four-way" | "eight-way";

export interface AstarSettings {
  readonly heuristic: AstarHeuristic;
  readonly movementMode: AstarMovementMode;
  readonly allowCornerCutting: boolean;
  readonly weight: number;
}

export type AstarEngineStepKind =
  | "started"
  | "node-opened"
  | "node-closed"
  | "cost-updated"
  | "path-found"
  | "no-path";

export interface AstarCosts {
  readonly g: number;
  readonly h: number;
  readonly f: number;
}

export interface AstarEngineStepEvent {
  readonly sequence: number;
  readonly kind: AstarEngineStepKind;
  readonly coordinate: GridCoordinate | null;
  readonly current: GridCoordinate | null;
  readonly costs: AstarCosts | null;
  readonly parent: GridCoordinate | null;
  readonly path: ReadonlyArray<GridCoordinate> | null;
  readonly evaluatedNodes: number;
  readonly openSize: number;
  readonly closedSize: number;
  readonly elapsedMs: number;
}

export const AstarDomEventNames = {
  CellClick: "cell-click",
  CellDrag: "cell-drag",
  CellDrop: "cell-drop",
  Start: "start",
  Pause: "pause",
  Step: "step",
  Reset: "reset",
  SpeedChange: "speed-change",
  PlacementModeChange: "placement-mode-change",
  SettingsChange: "settings-change",
  GridLoaded: "grid-loaded",
  GridChanged: "grid-changed",
  ObstacleTypeSelected: "obstacle-type-selected",
} as const;

export interface CellClickEventDetail {
  readonly row: GridRow;
  readonly col: GridCol;
}

export interface CellDragEventDetail {
  readonly row: GridRow;
  readonly col: GridCol;
  readonly phase: DragPhase;
}

export interface CellDropEventDetail {
  readonly row: GridRow;
  readonly col: GridCol;
  readonly obstacleType: string;
}

export interface SpeedChangeEventDetail {
  readonly millisecondsPerStep: number;
}

export interface PlacementModeChangeEventDetail {
  readonly mode: PlacementMode;
}

export interface SettingsChangeEventDetail {
  readonly settings: AstarSettings;
}

export interface ResetEventDetail {
  readonly preserveWalls: boolean;
  readonly preserveStartAndGoal: boolean;
}

export interface GridLoadedEventDetail {
  readonly document: PersistedGridDocument;
  readonly snapshot: GridSnapshot;
}

export interface GridChangedEventDetail {
  readonly snapshot: GridSnapshot;
}

export interface ObstacleTypeSelectedEventDetail {
  readonly obstacleType: string;
}

export interface AstarVisualizerEventMap {
  readonly "cell-click": CellClickEventDetail;
  readonly "cell-drag": CellDragEventDetail;
  readonly "cell-drop": CellDropEventDetail;
  readonly "start": Record<string, never>;
  readonly "pause": Record<string, never>;
  readonly "step": Record<string, never>;
  readonly "reset": ResetEventDetail;
  readonly "speed-change": SpeedChangeEventDetail;
  readonly "placement-mode-change": PlacementModeChangeEventDetail;
  readonly "settings-change": SettingsChangeEventDetail;
  readonly "grid-loaded": GridLoadedEventDetail;
  readonly "grid-changed": GridChangedEventDetail;
  readonly "obstacle-type-selected": ObstacleTypeSelectedEventDetail;
}

export interface PersistedGridDocument {
  readonly schemaVersion: 1;
  readonly rows: number;
  readonly cols: number;
  readonly start: GridCoordinate | null;
  readonly goal: GridCoordinate | null;
  readonly walls: ReadonlyArray<GridCoordinate>;
}

export class GridLoadedEventDetailValue {
  public declare document: PersistedGridDocument;
  public declare snapshot: GridSnapshot;
}

export class GridChangedEventDetailValue {
  public declare snapshot: GridSnapshot;
}

export class ObstacleTypeSelectedEventDetailValue {
  public declare obstacleType: string;
}

export function createEmptyCellState(): CellState {
  return {
    role: "empty",
    visitState: "unvisited",
    g: null,
    h: null,
    f: null,
    parentDirection: null,
  };
}

export function createIdleStats(): AstarStats {
  return {
    evaluatedNodes: 0,
    openSize: 0,
    closedSize: 0,
    pathLength: null,
    elapsedMs: 0,
    status: "idle",
  };
}

export function createDefaultSettings(): AstarSettings {
  return {
    heuristic: "manhattan",
    movementMode: "four-way",
    allowCornerCutting: false,
    weight: 1,
  };
}

export function createEmptyGridSnapshot(
  rows: number,
  cols: number,
): GridSnapshot {
  if (!Number.isInteger(rows) || rows < 0) {
    throw new Error("Grid rows must be a non-negative integer.");
  }

  if (!Number.isInteger(cols) || cols < 0) {
    throw new Error("Grid cols must be a non-negative integer.");
  }

  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => createEmptyCellState()),
  );
}

export function isValidGridCoordinate(
  snapshot: GridSnapshot,
  coordinate: GridCoordinate,
): boolean {
  if (coordinate.row < 0 || coordinate.col < 0) {
    return false;
  }

  if (!Number.isInteger(coordinate.row) || !Number.isInteger(coordinate.col)) {
    return false;
  }

  if (coordinate.row >= snapshot.length) {
    return false;
  }

  const row = snapshot[coordinate.row];

  if (row === undefined) {
    return false;
  }

  return coordinate.col < row.length;
}
