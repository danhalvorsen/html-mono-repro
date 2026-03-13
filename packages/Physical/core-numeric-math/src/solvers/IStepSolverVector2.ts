import { Vector2 } from "@monorepo/core-math";

import type { IFirstOrderDerivative2 } from "../calculus/derivatives/IFirstOrderDerivative2.js";
import type { ISolutionPoint2 } from "./ISolutionPoint2.js";

export interface IStepSolverVector2 {
  solve(
    derivative: IFirstOrderDerivative2,
    initialTime: number,
    initialState: Vector2,
    stepSize: number,
    stepCount: number
  ): readonly ISolutionPoint2[];
}