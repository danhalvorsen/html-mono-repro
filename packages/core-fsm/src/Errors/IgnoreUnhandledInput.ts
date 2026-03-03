import { IUnhandledInputPolicy } from "./IUnhandledInputPolicy.js";
import { StateId, IInput, InputType, IDispatchResult } from "../Types.js";

export class IgnoreUnhandledInput<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> implements IUnhandledInputPolicy<TState, TContext, TInput, TOut> {
  public handle(args: { state: TState; context: TContext; input: TInput; }): IDispatchResult<TState, TInput, TContext, TOut> {
    return {
      from: args.state,
      to: args.state,
      input: args.input,
      context: args.context,
      outputs: Object.freeze([]),
      transitionTaken: false,
    };
  }
}
