import { IFsm, IFsmDefinition } from "./IFsm.js";
import { ITransition } from "./ITransition.js";
import { ThrowOnUnhandledInput } from "./Errors/ThrowOnUnhandledInput.js";
import { IUnhandledInputPolicy } from "./Errors/IUnhandledInputPolicy.js";
import { StateId, IInput, InputType, IDispatchResult } from "./Types.js";

/* ============================= ENGINE (PURE, SRP) ============================= */

export class FsmEngine<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> implements IFsm<TState, TContext, TInput, TOut> {
  private readonly def: IFsmDefinition<TState, TContext, TInput, TOut>;
  private readonly initialContext: TContext;
  private readonly unhandled: IUnhandledInputPolicy<TState, TContext, TInput, TOut>;

  private _state: TState;
  private _context: TContext;

  public constructor(args: {
    readonly definition: IFsmDefinition<TState, TContext, TInput, TOut>;
    readonly context: TContext;
    readonly unhandledInputPolicy?: IUnhandledInputPolicy<TState, TContext, TInput, TOut>;
  }) {
    this.def = args.definition;
    this.initialContext = args.context;
    this.unhandled = args.unhandledInputPolicy ?? new ThrowOnUnhandledInput();

    this._state = this.def.initial;
    this._context = args.context;
  }

  public get state(): TState { return this._state; }
  public get context(): TContext { return this._context; }

  public reset(context?: TContext): void {
    this._state = this.def.initial;
    this._context = context ?? this.initialContext;
  }

  public async dispatch(input: TInput): Promise<IDispatchResult<TState, TInput, TContext, TOut>> {
    const from = this._state;
    const prevContext = this._context;

    const t = this.def.getTransition(from, input.type);
    if (!t) return this.unhandled.handle({ state: from, context: prevContext, input });

    const allowed = await this.canTake(t, prevContext, input);
    if (!allowed) {
      return {
        from,
        to: from,
        input,
        context: prevContext,
        outputs: Object.freeze([]),
        transitionTaken: false,
      };
    }

    const nextContext = await this.applyReducer(t, prevContext, input);
    const outputs = await this.emitOutputs(t, nextContext, input);

    this._context = nextContext;
    this._state = t.to;

    return {
      from,
      to: this._state,
      input,
      context: this._context,
      outputs,
      transitionTaken: true,
    };
  }

  private async canTake(
    t: ITransition<TState, TContext, TInput, TOut>,
    context: TContext,
    input: TInput
  ): Promise<boolean> {
    if (!t.guard) return true;
    return await t.guard({ context, input });
  }

  private async applyReducer(
    t: ITransition<TState, TContext, TInput, TOut>,
    context: TContext,
    input: TInput
  ): Promise<TContext> {
    if (!t.reduce) return context;
    return await t.reduce({ context, input });
  }

  private async emitOutputs(
    t: ITransition<TState, TContext, TInput, TOut>,
    context: TContext,
    input: TInput
  ): Promise<readonly TOut[]> {
    if (!t.output) return Object.freeze([]);
    const out = await t.output({ context, input });
    return out === undefined ? Object.freeze([]) : Object.freeze([out]);
  }
}
