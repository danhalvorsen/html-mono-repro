import { IStateCloner } from "./IStateCloner.js";

export class DelegateStateCloner<TState> implements IStateCloner<TState> {
  public constructor(
    private readonly cloneDelegate: (state: TState) => TState
  ) { }

  public clone(state: TState): TState {
    return this.cloneDelegate(state);
  }
}
