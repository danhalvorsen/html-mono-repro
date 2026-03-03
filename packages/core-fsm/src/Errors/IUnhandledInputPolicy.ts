import { StateId, IInput, InputType, IDispatchResult } from "../Types.js";

/* ============================= UNHANDLED INPUT POLICY (OCP) ============================= */

export interface IUnhandledInputPolicy<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> {
  handle(args: {
    readonly state: TState;
    readonly context: TContext;
    readonly input: TInput;
  }): IDispatchResult<TState, TInput, TContext, TOut>;
}
