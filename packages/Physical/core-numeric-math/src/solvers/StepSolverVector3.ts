 
import { NumericGuards } from "../guards/NumericGuards.js";
import type { Vector3 } from "@monorepo/core-math";  
import type { IFirstOrderDerivative3 } from "../calculus/derivatives/IFirstOrderDerivative3.js";
import type { IIntegratorVector3 } from "../integration/contracts/IIntegratorVector3.js";
import type { ISolutionPoint3 } from "./ISolutionPoint3.js";
import type { IStepSolverVector3 } from "./IStepSolverVector3.js";

export class StepSolverVector3 implements IStepSolverVector3 {
  public constructor(
    private readonly integrator: IIntegratorVector3
  ) {}

  public solve(
    derivative: IFirstOrderDerivative3,
    initialTime: number,
    initialState: Vector3,
    stepSize: number,
    stepCount: number
  ): readonly ISolutionPoint3[] {
    NumericGuards.ensureFinite(initialTime, "initialTime");
    NumericGuards.ensurePositive(stepSize, "stepSize");
    NumericGuards.ensureNonNegativeInteger(stepCount, "stepCount");

    const result: ISolutionPoint3[] = [];

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