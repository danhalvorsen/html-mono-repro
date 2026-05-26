import type {
  GridCoordinate,
  GridSnapshot,
  PlacementMode,
} from "../contracts/AstarVisualizerContracts.js";

export interface IPlacementPolicy {
  canPlace(
    coordinate: GridCoordinate,
    mode: PlacementMode,
    snapshot: GridSnapshot,
  ): boolean;
}
