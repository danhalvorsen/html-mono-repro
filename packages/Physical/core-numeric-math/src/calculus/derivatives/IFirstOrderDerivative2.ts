import { Vector2 } from "@monorepo/core-math";

import type { IDerivative } from "./IDerivative.js";

export interface IFirstOrderDerivative2 extends IDerivative {
  evaluate(time: number, state: Vector2): Vector2;
}