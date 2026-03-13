import { Vector2 } from "@monorepo/core-math";

import type { IFirstOrderDerivative2 } from "../../calculus/derivatives/IFirstOrderDerivative2.js";

export interface IIntegratorVector2 {
  step(
    derivative: IFirstOrderDerivative2,
    time: number,
    state: Vector2,
    stepSize: number
  ): Vector2;
}