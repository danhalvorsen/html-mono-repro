export interface IStateCloner<TState> {
  clone(state: TState): TState;
}
