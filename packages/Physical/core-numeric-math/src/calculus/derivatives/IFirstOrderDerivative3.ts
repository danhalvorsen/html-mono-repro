import { Vector3 } from "@monorepo/core-math";

import type { IDerivative } from "./IDerivative.js";

export interface IFirstOrderDerivative3 extends IDerivative {
  evaluate(time: number, state: Vector3): Vector3;
}