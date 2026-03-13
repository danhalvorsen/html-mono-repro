import { IPdeSnapshot } from "./IPdeSnapshot.js";


export interface IPdeSolver<TState, TWorkspace> {
  solve(
    initialState: TState,
    workspace: TWorkspace,
    initialTime: number,
    timeStep: number,
    stepCount: number
  ): readonly IPdeSnapshot<TState>[];
}
