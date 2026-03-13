 
import type { Vector3 } from "@monorepo/core-math";  
 
import { IIntegratorVector3, IFirstOrderDerivative3, ISolutionPoint3, IStepSolverVector3 } from "@monorepo/core-numeric-math";
import { NumberGuards } from '../guards/NumberGuards.js';

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
    NumberGuards.ensureFinite(initialTime, "initialTime");
    NumberGuards.ensurePositive(stepSize, "stepSize");
    NumberGuards.ensureNonNegativeInteger(stepCount, "stepCount");

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