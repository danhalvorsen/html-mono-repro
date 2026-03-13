import { IPdeSnapshot } from "./IPdeSnapshot.js";
import { IPdeSolver } from "./IPdeSolver.js";
import { IPdeStepper } from "./IPdeStepper.js";
import { IStateCloner } from "./IStateCloner.js";
import { PdeSnapshot } from "./PdeSnapshot.js";
import { NumberGuards } from "../guards/NumberGuards.js";

export class DefaultPdeSolver<TState, TWorkspace> implements IPdeSolver<TState, TWorkspace> {
  public constructor(
    private readonly stepper: IPdeStepper<TState, TWorkspace>,
    private readonly stateCloner: IStateCloner<TState>
  ) { }

  public solve(
    initialState: TState,
    workspace: TWorkspace,
    initialTime: number,
    timeStep: number,
    stepCount: number
  ): readonly IPdeSnapshot<TState>[] {
    NumberGuards.ensureFinite(initialTime, "initialTime");
    NumberGuards.ensurePositive(timeStep, "timeStep");
    NumberGuards.ensureNonNegativeInteger(stepCount, "stepCount");

    const state = this.stateCloner.clone(initialState);
    const result: IPdeSnapshot<TState>[] = [];

    let time = initialTime;
    result.push(new PdeSnapshot(time, this.stateCloner.clone(state)));

    for (let index = 0; index < stepCount; index++) {
      this.stepper.step(state, workspace, timeStep);
      time += timeStep;
      result.push(new PdeSnapshot(time, this.stateCloner.clone(state)));
    }

    return result;
  }
}
