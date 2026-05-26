import type { GridCoordinate } from "./contracts/AstarContracts.js";

export function createTerrainPolicy(
  resolver: (coordinate: GridCoordinate) => number,
): (coordinate: GridCoordinate) => number {
  return (coordinate) => resolver(coordinate);
}
