 
import {
  FsmEngine,
  IgnoreUnhandledInput,
  LoggedFsmEngine,
  NoTransitionError,
  ThrowOnUnhandledInput,
} from "../../src/index.js";
import { FsmDefinition } from "../../src/FsmDefinition.js";
import type { IInput, ILogger } from "../../src/Types.js";

export type State = "Idle" | "Running";
export type Ctx = { readonly n: number };
export type Out = { readonly kind: "out"; readonly value: number };

export type Start = IInput<"Start", { readonly inc: number }>;
export type Stop = IInput<"Stop", {}>;
export type Input = Start | Stop;

export class LoggedFsmEngineFixture {
  public readonly S = { Idle: "Idle", Running: "Running" } as const;
  public readonly E = { Start: "Start", Stop: "Stop" } as const;

  public createLogger(): MemoryLogger {
    return new MemoryLogger();
  }

  public createDefinition_Default(): FsmDefinition<State, Ctx, Input, Out> {
    return new FsmDefinition<State, Ctx, Input, Out>({
      initial: this.S.Idle,
      transitions: [
        {
          from: this.S.Idle,
          on: this.E.Start,
          to: this.S.Running,

          // must accept Input (union) when you construct transitions directly like this
          action: ({
            context,
            input,
          }: {
            readonly context: Ctx;
            readonly input: Input;
          }) => {
            if (input.type !== this.E.Start) return context; // safety; should never happen
            return { n: context.n + input.payload.inc };
          },

          // output must accept Input (union) as well
          output: ({
            context,
          }: {
            readonly context: Ctx;
            readonly input: Input;
          }) => ({
            kind: "out",
            value: context.n,
          }),
        },
        { from: this.S.Running, on: this.E.Stop, to: this.S.Idle },
      ],
    });
  }

  public createDefinition_GuardBlocks(): FsmDefinition<State, Ctx, Input, Out> {
    return new FsmDefinition<State, Ctx, Input, Out>({
      initial: this.S.Idle,
      transitions: [
        {
          from: this.S.Idle,
          on: this.E.Start,
          to: this.S.Running,
          guard: async () => false,
        },
      ],
    });
  }

  public createInnerEngine(
    def: FsmDefinition<State, Ctx, Input, Out>,
    args?: { readonly unhandled?: "throw" | "ignore" },
  ): FsmEngine<State, Ctx, Input, Out> {
    const unhandledInputPolicy =
      args?.unhandled === "ignore"
        ? new IgnoreUnhandledInput<State, Ctx, Input, Out>()
        : new ThrowOnUnhandledInput<State, Ctx, Input, Out>();

    return new FsmEngine<State, Ctx, Input, Out>({
      definition: def,
      context: { n: 0 },
      unhandledInputPolicy,
    });
  }

  public createLoggedEngine(
    inner: FsmEngine<State, Ctx, Input, Out>,
    logger: ILogger,
    args?: { readonly name?: string; readonly verbose?: boolean },
  ) {
    return new LoggedFsmEngine<State, Ctx, Input, Out>({
      inner,
      logger,
      machineName: args?.name ?? "TestFSM",
      verbose: args?.verbose ?? false,
    });
  }
}

export class MemoryLogger implements ILogger {
  private readonly _calls: Array<{
    level: "debug" | "info" | "warn" | "error";
    template: string;
    params?: any;
  }> = [];

  public debug(template: string, params?: any): void {
    this._calls.push({ level: "debug", template, params });
  }
  public info(template: string, params?: any): void {
    this._calls.push({ level: "info", template, params });
  }
  public warn(template: string, params?: any): void {
    this._calls.push({ level: "warn", template, params });
  }
  public error(template: string, params?: any): void {
    this._calls.push({ level: "error", template, params });
  }

  public count(level: "debug" | "info" | "warn" | "error"): number {
    return this._calls.filter((c) => c.level === level).length;
  }

  public last(level: "debug" | "info" | "warn" | "error") {
    const xs = this._calls.filter((c) => c.level === level);
    return xs.length ? xs[xs.length - 1] : undefined;
  }

  public any(
    level: "debug" | "info" | "warn" | "error",
    predicate: (c: { template: string; params?: any }) => boolean,
  ): boolean {
    return this._calls.some((c) => c.level === level && predicate(c));
  }
}

export { NoTransitionError };
