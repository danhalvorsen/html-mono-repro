import type { Direction } from "./Direction";

export interface IPlacementOperation {
  readonly kind: "Placement";
  readonly direction: Direction;
  readonly count: number;
}
