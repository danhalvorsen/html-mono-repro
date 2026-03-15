import { Vector3 } from "@monorepo/core-math";

import type { IFirstOrderDerivative3 } from "../../calculus/derivatives/IFirstOrderDerivative3.js";

export interface IIntegratorVector3 {
  step(
    derivative: IFirstOrderDerivative3,
    time: number,
    state: Vector3,
    stepSize: number
  ): Vector3;
}