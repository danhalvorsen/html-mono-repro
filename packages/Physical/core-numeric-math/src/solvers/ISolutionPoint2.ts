import { Vector2 } from "@monorepo/core-math";

export interface ISolutionPoint2 {
  readonly time: number;
  readonly state: Vector2;
}