import type { Direction } from "./Direction.js";

export interface IPlacementOperation {
  readonly kind: "Placement";
  readonly direction: Direction;
  readonly count: number;
}
