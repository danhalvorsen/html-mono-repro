import { Vector3 } from "@monorepo/core-math";

export interface ISolutionPoint3 {
  readonly time: number;
  readonly state: Vector3;
}