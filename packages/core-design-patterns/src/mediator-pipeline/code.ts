// ============================================================================
// Functional Result
// ============================================================================
namespace Functional {
  export type Ok<T> = { ok: true; value: T };
  export type Err<E> = { ok: false; error: E };
  export type Result<T, E> = Ok<T> | Err<E>;

  export const Ok = <T>(value: T): Ok<T> => ({ ok: true, value });
  export const Err = <E>(error: E): Err<E> => ({ ok: false, error });
}

// ============================================================================
// Messaging
// ============================================================================
namespace Messaging {
  export interface IMessage {
    readonly name: string;
  }

  export interface INotification extends IMessage {}
}

// ============================================================================
// Context (async-safe, shared)
// ============================================================================
namespace Context {
  export interface IContextPipeline {
    set<T>(key: symbol, value: T): void;
    get<T>(key: symbol): T | undefined;
  }

  export class PipelineContext implements IContextPipeline {
    private readonly store = new Map<symbol, unknown>();

    set<T>(key: symbol, value: T): void {
      this.store.set(key, value);
    }

    get<T>(key: symbol): T | undefined {
      return this.store.get(key) as T | undefined;
    }
  }
}

// ============================================================================
// Pipeline Contracts
// ============================================================================
namespace Pipeline {
  import IMessage = Messaging.IMessage;
  import Result = Functional.Result;
  import IContextPipeline = Context.IContextPipeline;

  export interface IBehaviorResult {
    readonly behavior: string;
  }

  export interface IBehavior<
    TMsg extends IMessage,
    TResult extends IBehaviorResult,
    TError extends IBehaviorResult
  > {
    execute(
      ctx: IContextPipeline,
      msg: TMsg
    ): Promise<Result<TResult, TError>>;
  }

  export interface IHandler<TMsg extends IMessage, TResult> {
    handle(ctx: IContextPipeline, msg: TMsg): Promise<TResult>;
  }
}

// ============================================================================
// Events (fan-out notifications)
// ============================================================================
namespace Events {
  import INotification = Messaging.INotification;

  export interface INotificationHandler<T extends INotification> {
    handle(event: T): Promise<void>;
  }

  export class EventBus {
    constructor(
      private readonly handlers: ReadonlyArray<INotificationHandler<any>>
    ) {}

    async publish<T extends INotification>(event: T): Promise<void> {
      await Promise.all(this.handlers.map(h => h.handle(event)));
    }
  }
}

// ============================================================================
// Pipeline Implementations (single + composite)
// ============================================================================
namespace PipelineImpl {
  import IMessage = Messaging.IMessage;
  import Result = Functional.Result;
  import Ok = Functional.Ok;
  import Err = Functional.Err;
  import IContextPipeline = Context.IContextPipeline;
  import IBehavior = Pipeline.IBehavior;
  import IHandler = Pipeline.IHandler;

  export const PIPELINE_RESULT = Symbol("pipeline.result");

  export class Pipeline<TMsg extends IMessage, TResult> {
    constructor(
      private readonly behaviors: ReadonlyArray<IBehavior<TMsg, any, any>>,
      private readonly handler: IHandler<TMsg, TResult>
    ) {}

    async execute(
      ctx: IContextPipeline,
      msg: TMsg
    ): Promise<Result<TResult, any>> {

      for (const b of this.behaviors) {
        const r = await b.execute(ctx, msg);
        if (!r.ok) {
          return Err(r.error);
        }
      }

      const result = await this.handler.handle(ctx, msg);
      ctx.set(PIPELINE_RESULT, result);
      return Ok(result);
    }
  }

  export class CompositePipeline<TMsg extends IMessage, TResult> {
    constructor(
      private readonly pipelines: ReadonlyArray<Pipeline<TMsg, TResult>>
    ) {}

    async execute(
      ctx: IContextPipeline,
      msg: TMsg
    ): Promise<Result<TResult, any>> {
      for (const p of this.pipelines) {
        const r = await p.execute(ctx, msg);
        if (!r.ok) return r;
      }
      return Ok(ctx.get<TResult>(PIPELINE_RESULT)!);
    }
  }
}

// ============================================================================
// Mediator (async context propagation + events)
// ============================================================================
namespace Mediator {
  import IMessage = Messaging.IMessage;
  import Result = Functional.Result;
  import Pipeline = PipelineImpl.Pipeline;
  import PipelineContext = Context.PipelineContext;
  import EventBus = Events.EventBus;
  import INotification = Messaging.INotification;

  export class Mediator<TMsg extends IMessage, TResult> {
    constructor(
      private readonly pipeline: Pipeline<TMsg, TResult>,
      private readonly events?: EventBus
    ) {}

    async send(
      msg: TMsg,
      ctx: PipelineContext = new PipelineContext()
    ): Promise<Result<TResult, any>> {

      const result = await this.pipeline.execute(ctx, msg);

      if (result.ok && this.events) {
        const evt: INotification = { name: `${msg.name}.Handled` };
        await this.events.publish(evt);
      }

      return result;
    }
  }
}

// ============================================================================
// Behaviors (typed results, self-healing capable)
// ============================================================================
namespace Behaviors {
  import IMessage = Messaging.IMessage;
  import Result = Functional.Result;
  import Ok = Functional.Ok;
  import Err = Functional.Err;
  import IBehavior = Pipeline.IBehavior;
  import IContextPipeline = Context.IContextPipeline;

  // ---------- Validation ----------
  export type ValidationOk = { behavior: "validation" };
  export type ValidationErr = { behavior: "validation"; reason: string };

  export class ValidationBehavior<T extends IMessage>
    implements IBehavior<T, ValidationOk, ValidationErr> {

    async execute(
      _: IContextPipeline,
      msg: T
    ): Promise<Result<ValidationOk, ValidationErr>> {

      if (!msg.name) {
        return Err({ behavior: "validation", reason: "Missing name" });
      }

      return Ok({ behavior: "validation" });
    }
  }

  // ---------- Performance ----------
  export type PerformanceOk = { behavior: "performance"; ms: number };
  export type PerformanceErr = { behavior: "performance"; ms: number };

  const START = Symbol("perf.start");

  export class PerformanceBehavior<T extends IMessage>
    implements IBehavior<T, PerformanceOk, PerformanceErr> {

    async execute(
      ctx: IContextPipeline,
      _: T
    ): Promise<Result<PerformanceOk, PerformanceErr>> {

      const start = ctx.get<number>(START);
      if (!start) {
        ctx.set(START, performance.now());
        return Ok({ behavior: "performance", ms: 0 });
      }

      const ms = performance.now() - start;
      return Ok({ behavior: "performance", ms });
    }
  }
}

// ============================================================================
// Sample Usage
// ============================================================================
namespace Sample {
  import IMessage = Messaging.IMessage;
  import Pipeline = PipelineImpl.Pipeline;
  import MessageMediator = Mediator.Mediator; // ✅ fixed
  import ValidationBehavior = Behaviors.ValidationBehavior;
  import PerformanceBehavior = Behaviors.PerformanceBehavior;
  import Result = Functional.Result;

  class FooMessage implements IMessage {
    readonly name = "FooMessage";
  }

  const handler = {
    async handle(): Promise<string> {
      return "SUCCESS";
    }
  };

  const pipeline = new Pipeline(
    [
      new ValidationBehavior<FooMessage>(),
      new PerformanceBehavior<FooMessage>()
    ],
    handler
  );

  const mediator = new MessageMediator(pipeline);

  export async function run(): Promise<void> {
    const result: Result<string, any> =
      await mediator.send(new FooMessage());

    if (result.ok) {
      console.log(result.value);
    }
  }
}