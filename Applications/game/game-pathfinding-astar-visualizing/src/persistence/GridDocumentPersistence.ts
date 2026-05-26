import type {
  GridCoordinate,
  GridSnapshot,
  PersistedGridDocument,
} from "../contracts/AstarVisualizerContracts.js";
import {
  createEmptyCellState,
  createEmptyGridSnapshot,
} from "../contracts/AstarVisualizerContracts.js";

export function exportGridDocument(snapshot: GridSnapshot): PersistedGridDocument {
  const rows = snapshot.length;
  const cols = snapshot[0]?.length ?? 0;

  let start: GridCoordinate | null = null;
  let goal: GridCoordinate | null = null;
  const walls: GridCoordinate[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const role = snapshot[row]?.[col]?.role;
      if (role === "start") {
        start = { row, col };
      } else if (role === "goal") {
        goal = { row, col };
      } else if (role === "wall") {
        walls.push({ row, col });
      }
    }
  }

  return {
    schemaVersion: 1,
    rows,
    cols,
    start,
    goal,
    walls,
  };
}

export function importGridDocument(document: PersistedGridDocument): GridSnapshot {
  validate(document);

  const snapshot = createEmptyGridSnapshot(document.rows, document.cols)
    .map((row) => row.map((cell) => ({ ...cell })));

  for (const wall of document.walls) {
    snapshot[wall.row]![wall.col] = {
      ...createEmptyCellState(),
      role: "wall",
    };
  }

  if (document.start !== null) {
    snapshot[document.start.row]![document.start.col] = {
      ...createEmptyCellState(),
      role: "start",
    };
  }

  if (document.goal !== null) {
    snapshot[document.goal.row]![document.goal.col] = {
      ...createEmptyCellState(),
      role: "goal",
    };
  }

  return snapshot;
}

function validate(document: PersistedGridDocument): void {
  if (document.schemaVersion !== 1) {
    throw new Error("Unsupported grid document schema version.");
  }

  if (!Number.isInteger(document.rows) || document.rows <= 0) {
    throw new Error("Grid rows must be a positive integer.");
  }

  if (!Number.isInteger(document.cols) || document.cols <= 0) {
    throw new Error("Grid cols must be a positive integer.");
  }

  for (const coordinate of document.walls) {
    assertCoordinate(coordinate, document.rows, document.cols, "wall");
  }

  if (document.start !== null) {
    assertCoordinate(document.start, document.rows, document.cols, "start");
  }

  if (document.goal !== null) {
    assertCoordinate(document.goal, document.rows, document.cols, "goal");
  }
}

function assertCoordinate(
  coordinate: GridCoordinate,
  rows: number,
  cols: number,
  label: string,
): void {
  if (!Number.isInteger(coordinate.row) || !Number.isInteger(coordinate.col)) {
    throw new Error(`${label} coordinate must be an integer.`);
  }

  if (coordinate.row < 0 || coordinate.row >= rows || coordinate.col < 0 || coordinate.col >= cols) {
    throw new Error(`${label} coordinate outside grid bounds.`);
  }
}
