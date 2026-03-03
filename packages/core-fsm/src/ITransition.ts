import { StateId, IInput, InputType, Guard, ContextReducer, OutputFactory } from "./Types.js";

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
  readonly reduce?: ContextReducer<TContext, TInput>;
  readonly output?: OutputFactory<TContext, TInput, TOut>;
}
