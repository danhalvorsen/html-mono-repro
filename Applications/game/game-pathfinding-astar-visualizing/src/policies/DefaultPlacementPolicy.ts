import {
  isValidGridCoordinate,
  type GridCoordinate,
  type GridSnapshot,
  type PlacementMode,
} from "../contracts/AstarVisualizerContracts.js";
import type { IPlacementPolicy } from "./IPlacementPolicy.js";

export class DefaultPlacementPolicy implements IPlacementPolicy {
  public canPlace(
    coordinate: GridCoordinate,
    mode: PlacementMode,
    snapshot: GridSnapshot,
  ): boolean {
    if (!isValidGridCoordinate(snapshot, coordinate)) {
      return false;
    }

    const cell = snapshot[coordinate.row]?.[coordinate.col];

    if (cell === undefined) {
      return false;
    }

    if (mode === "erase") {
      return true;
    }

    if (mode === "wall") {
      return cell.role !== "start" && cell.role !== "goal";
    }

    return cell.role !== "wall";
  }
}
