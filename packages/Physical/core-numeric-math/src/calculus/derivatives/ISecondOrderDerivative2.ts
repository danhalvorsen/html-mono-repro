import { Vector2 } from "@monorepo/core-math";

import type { IDerivative } from "./IDerivative.js";

export interface ISecondOrderDerivative2 extends IDerivative {
  evaluate(
    time: number,
    position: Vector2,
    velocity: Vector2
  ): Vector2;
}