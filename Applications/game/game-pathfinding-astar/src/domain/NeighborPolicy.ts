import type {
  AstarMovementMode,
  GridCoordinate,
} from "../contracts/AstarContracts.js";

const FOUR_WAY_DIRECTIONS: ReadonlyArray<Readonly<[number, number]>> = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
] as const;

const EIGHT_WAY_DIRECTIONS: ReadonlyArray<Readonly<[number, number]>> = [
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
] as const;

export interface INeighborPolicy {
  getNeighborOffsets(mode: AstarMovementMode): ReadonlyArray<Readonly<[number, number]>>;
}

export class DefaultNeighborPolicy implements INeighborPolicy {
  public getNeighborOffsets(
    mode: AstarMovementMode,
  ): ReadonlyArray<Readonly<[number, number]>> {
    if (mode === "four-way") {
      return FOUR_WAY_DIRECTIONS;
    }

    return EIGHT_WAY_DIRECTIONS;
  }
}

export function isDiagonalMove(from: GridCoordinate, to: GridCoordinate): boolean {
  return from.row !== to.row && from.col !== to.col;
}
