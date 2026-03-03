// types.ts (ESM)
// Keep type-only concerns here. No logic.

export type StateId = string | symbol;
export type InputType = string | symbol;

export type MaybePromise<T> = T | Promise<T>;
export type ILogParams = Record<string, any>;

export interface IInput<TType extends InputType = InputType, TPayload = unknown> {
  readonly type: TType;
  readonly payload: TPayload;
}

export type Guard<TContext, TInput extends IInput> =
  (args: { readonly context: TContext; readonly input: TInput }) => MaybePromise<boolean>;

export type TransitionAction<TContext, TInput extends IInput> =
  (args: { readonly context: TContext; readonly input: TInput }) => MaybePromise<TContext>;

export type OutputFactory<TContext, TInput extends IInput, TOut> =
  (args: { readonly context: TContext; readonly input: TInput }) => MaybePromise<TOut | undefined>;

export interface IDispatchResult<TState extends StateId, TInput extends IInput, TContext, TOut> {
  readonly from: TState;
  readonly to: TState;
  readonly input: TInput;
  readonly context: TContext;
  readonly outputs: readonly TOut[];
  readonly transitionTaken: boolean;
}

export interface ILogger {
  debug(template: string, params?: ILogParams): void;
  info(template: string, params?: ILogParams): void;
  warn(template: string, params?: ILogParams): void;
  error(template: string, params?: ILogParams): void;
}