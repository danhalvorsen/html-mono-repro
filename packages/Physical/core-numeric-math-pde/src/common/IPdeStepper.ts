
export interface IPdeStepper<TState, TWorkspace> {
  step(
    state: TState,
    workspace: TWorkspace,
    timeStep: number
  ): void;
}
