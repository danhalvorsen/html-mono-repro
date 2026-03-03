import { IFsm } from "./IFsm.js";
import { StateId, IInput, InputType, ILogger, IDispatchResult } from "./Types.js";
 
export class LoggedFsmEngine<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> implements IFsm<TState, TContext, TInput, TOut> {
  private readonly inner: IFsm<TState, TContext, TInput, TOut>;
  private readonly log: ILogger;
  private readonly name: string;
  private readonly verbose: boolean;

  public constructor(args: {
    readonly inner: IFsm<TState, TContext, TInput, TOut>;
    readonly logger: ILogger;
    readonly machineName?: string;
    readonly verbose?: boolean;
  }) {
    this.inner = args.inner;
    this.log = args.logger;
    this.name = args.machineName ?? "FSM";
    this.verbose = args.verbose ?? false;
  }

  public get state(): TState { return this.inner.state; }
  public get context(): TContext { return this.inner.context; }

  public reset(context?: TContext): void {
    this.inner.reset(context);
    this.log.debug("[{name}] reset -> state={state}", { name: this.name, state: LoggedFsmEngine.idToString(this.state) });
  }

  public async dispatch(input: TInput): Promise<IDispatchResult<TState, TInput, TContext, TOut>> {
    const before = this.state;

    if (this.verbose) {
      this.log.debug("[{name}] dispatch start: state={state}, input={input}, payload={payload}", {
        name: this.name,
        state: LoggedFsmEngine.idToString(before),
        input: LoggedFsmEngine.idToString(input.type),
        payload: input.payload,
      });
    }

    try {
      const result = await this.inner.dispatch(input);

      if (result.transitionTaken) {
        this.log.info("[{name}] transition: {from} --{input}--> {to}", {
          name: this.name,
          from: LoggedFsmEngine.idToString(result.from),
          input: LoggedFsmEngine.idToString(result.input.type),
          to: LoggedFsmEngine.idToString(result.to),
        });
      } else {
        this.log.warn("[{name}] no transition taken: state={state}, input={input}", {
          name: this.name,
          state: LoggedFsmEngine.idToString(before),
          input: LoggedFsmEngine.idToString(input.type),
        });
      }

      if (this.verbose) {
        this.log.debug("[{name}] outputs={outputs} ctx={ctx}", {
          name: this.name,
          outputs: result.outputs,
          ctx: result.context,
        });
      }

      return result;
    } catch (error) {
      this.log.error("[{name}] dispatch error: state={state}, input={input}, error={error}", {
        name: this.name,
        state: LoggedFsmEngine.idToString(before),
        input: LoggedFsmEngine.idToString(input.type),
        error,
      });
      throw error;
    }
  }

  private static idToString(x: string | symbol): string {
    return typeof x === "symbol" ? x.toString() : String(x);
  }
}
