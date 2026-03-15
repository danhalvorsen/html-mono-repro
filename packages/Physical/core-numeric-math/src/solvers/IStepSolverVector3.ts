import { Vector3 } from "@monorepo/core-math";

import type { IFirstOrderDerivative3 } from "../calculus/derivatives/IFirstOrderDerivative3.js";
import type { ISolutionPoint3 } from "./ISolutionPoint3.js";

export interface IStepSolverVector3 {
  solve(
    derivative: IFirstOrderDerivative3,
    initialTime: number,
    initialState: Vector3,
    stepSize: number,
    stepCount: number
  ): readonly ISolutionPoint3[];
}