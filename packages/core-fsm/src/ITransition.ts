import { StateId, IInput, InputType, Guard, TransitionAction as TransitionAction, OutputFactory } from "./Types.js";

/* ============================= CONTRACTS ============================= */

export interface ITransition<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> {
  readonly from: TState;
  readonly on: TInput["type"];
  readonly to: TState;

  readonly guard?: Guard<TContext, TInput>;
  readonly action?: TransitionAction<TContext, TInput>;
  readonly output?: OutputFactory<TContext, TInput, TOut>;
}
