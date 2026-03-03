import { IUnhandledInputPolicy } from "./IUnhandledInputPolicy.js";
import { NoTransitionError } from "./NoTransitionError.js";
import { StateId, IInput, InputType, IDispatchResult } from "../Types.js";

export class ThrowOnUnhandledInput<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> implements IUnhandledInputPolicy<TState, TContext, TInput, TOut> {
  public handle(args: { state: TState; context: TContext; input: TInput; }): IDispatchResult<TState, TInput, TContext, TOut> {
    throw new NoTransitionError({
      from: ThrowOnUnhandledInput.idToString(args.state),
      inputType: ThrowOnUnhandledInput.idToString(args.input.type),
    });
  }

  private static idToString(x: string | symbol): string {
    return typeof x === "symbol" ? x.toString() : String(x);
  }
}
