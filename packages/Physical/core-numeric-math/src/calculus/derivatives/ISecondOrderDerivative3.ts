import { Vector3 } from "@monorepo/core-math";

import type { IDerivative } from "./IDerivative.js";

export interface ISecondOrderDerivative3 extends IDerivative {
  evaluate(
    time: number,
    position: Vector3,
    velocity: Vector3
  ): Vector3;
}