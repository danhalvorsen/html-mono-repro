import { ITransition } from "./ITransition.js";
import { IDispatchResult, IInput, InputType, StateId } from "./Types.js";

export interface IFsmDefinition<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> {
  readonly initial: TState;
  getTransition(from: TState, inputType: TInput["type"]): ITransition<TState, TContext, TInput, TOut> | undefined;
}

export interface IFsm<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> {
  readonly state: TState;
  readonly context: TContext;

  dispatch(input: TInput): Promise<IDispatchResult<TState, TInput, TContext, TOut>>;
  reset(context?: TContext): void;
}

