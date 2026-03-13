import { Vector2 } from "@monorepo/core-math";

import { NumericGuards } from "../guards/NumericGuards.js";

import type { IFirstOrderDerivative2 } from "../calculus/derivatives/IFirstOrderDerivative2.js";
import type { IIntegratorVector2 } from "../integration/contracts/IIntegratorVector2.js";
import type { ISolutionPoint2 } from "./ISolutionPoint2.js";
import type { IStepSolverVector2 } from "./IStepSolverVector2.js";

export class StepSolverVector2 implements IStepSolverVector2 {
  public constructor(
    private readonly integrator: IIntegratorVector2
  ) {}

  public solve(
    derivative: IFirstOrderDerivative2,
    initialTime: number,
    initialState: Vector2,
    stepSize: number,
    stepCount: number
  ): readonly ISolutionPoint2[] {
    NumericGuards.ensureFinite(initialTime, "initialTime");
    NumericGuards.ensurePositive(stepSize, "stepSize");
    NumericGuards.ensureNonNegativeInteger(stepCount, "stepCount");

    const result: ISolutionPoint2[] = [];

    let time = initialTime;
    let state = initialState;

    result.push({ time, state });

    for (let i = 0; i < stepCount; i++) {
      state = this.integrator.step(
        derivative,
        time,
        state,
        stepSize
      );

      time += stepSize;
      result.push({ time, state });
    }

    return result;
  }
}