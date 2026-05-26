import type {
  AstarHeuristic,
  GridCoordinate,
} from "../contracts/AstarContracts.js";

export function createCellKey(coordinate: GridCoordinate): string {
  return `${coordinate.row},${coordinate.col}`;
}

export function isWithinBounds(
  rows: number,
  cols: number,
  coordinate: GridCoordinate,
): boolean {
  return (
    coordinate.row >= 0
    && coordinate.col >= 0
    && coordinate.row < rows
    && coordinate.col < cols
  );
}

export function calculateHeuristic(
  heuristic: AstarHeuristic,
  from: GridCoordinate,
  to: GridCoordinate,
): number {
  const rowDistance = Math.abs(from.row - to.row);
  const colDistance = Math.abs(from.col - to.col);

  switch (heuristic) {
    case "manhattan":
      return rowDistance + colDistance;

    case "euclidean":
      return Math.hypot(rowDistance, colDistance);

    case "octile": {
      const diagonal = Math.min(rowDistance, colDistance);
      const straight = Math.max(rowDistance, colDistance) - diagonal;
      return diagonal * Math.SQRT2 + straight;
    }

    case "chebyshev":
      return Math.max(rowDistance, colDistance);

    default:
      return assertNever(heuristic);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported heuristic: ${String(value)}`);
}
