// packages/core-design-patterns/tests/Fixtures/MediatorFixture.ts
import { Err, Ok, Result } from '@monorepo/core-design-patterns';
import { INotification, INotificationBase} from '@monorepo/core-design-patterns-cqrs';
import {
  EventBus,
  IBehavior,
  IBehaviorResult,
  IContextPipeline,
  IHandler,
  IMessage,
  Mediator,
  Pipeline,
  PipelineContext,
} from '../../src/index.js';

class TaggedBehaviorResult implements IBehaviorResult {
  public constructor(public readonly behavior: string) {}
}

class TaggedBehaviorError extends TaggedBehaviorResult {
  public constructor(
    behavior: string,
    public readonly reason: string,
  ) {
    super(behavior);
  }
}

export class MediatorFixture {
  // ---- deterministic keys
  public readonly K = {
    touched: Symbol("fx.touched"),
    trace: Symbol("fx.trace"),
  } as const;

  // ---- message
  public createMessage(name = "FooMessage"): IMessage {
    return { name };
  }

  // ---- ctx
  public createContext(): PipelineContext {
    return new PipelineContext();
  }

  // ---- behaviors
  public createOkBehavior(tag: string): IBehavior<IMessage, IBehaviorResult, IBehaviorResult> {
    return new (class implements IBehavior<IMessage, IBehaviorResult, IBehaviorResult> {
      public async execute(
        ctx: IContextPipeline,
        _msg: IMessage,
      ): Promise<Result<IBehaviorResult, IBehaviorResult>> {
        const trace = ctx.get<string[]>(traceKey) ?? [];
        trace.push(tag);
        ctx.set(traceKey, trace);
        return Ok(new TaggedBehaviorResult(tag));
      }
    })();
  }

  public createErrBehavior(tag: string, reason = "boom"): IBehavior<IMessage, IBehaviorResult, IBehaviorResult> {
    return new (class implements IBehavior<IMessage, IBehaviorResult, IBehaviorResult> {
      public async execute(
        ctx: IContextPipeline,
        _msg: IMessage,
      ): Promise<Result<IBehaviorResult, IBehaviorResult>> {
        const trace = ctx.get<string[]>(traceKey) ?? [];
        trace.push(tag);
        ctx.set(traceKey, trace);
        return Err(new TaggedBehaviorError(tag, reason));
      }
    })();
  }

  // ---- handler
  public createHandler(result: string): IHandler<IMessage, string> {
    return {
      async handle(ctx: IContextPipeline, _msg: IMessage): Promise<string> {
        ctx.set(touchedKey, true);
        return result;
      },
    };
  }

  // ---- event recording
  public createRecordingEventBus() {
    const recorder = new RecordingNotificationHandler();
    const bus = new EventBus([recorder]);
    return { bus, recorder };
  }

  // ---- mediator builders
  public createMediator(opts: Readonly<{ behaviors: IBehavior<IMessage, IBehaviorResult, IBehaviorResult>[]; handlerResult: string }>) {
    const pipeline = new Pipeline<IMessage, string>(opts.behaviors, this.createHandler(opts.handlerResult));
    return new Mediator<IMessage, string>(pipeline);
  }

  public createMediatorWithEvents(opts: Readonly<{ behaviors: IBehavior<IMessage, IBehaviorResult, IBehaviorResult>[]; handlerResult: string }>) {
    const pipeline = new Pipeline<IMessage, string>(opts.behaviors, this.createHandler(opts.handlerResult));
    const { bus, recorder } = this.createRecordingEventBus();
    const mediator = new Mediator<IMessage, string>(pipeline, bus);
    return { mediator, recorder };
  }

  public ctxTrace(ctx: PipelineContext): readonly string[] {
    return ctx.get<string[]>(traceKey) ?? [];
  }

  public ctxTouched(ctx: PipelineContext): boolean {
    return ctx.get<boolean>(touchedKey) ?? false;
  }
}

class RecordingNotificationHandler {
  private readonly _events: INotification<INotificationBase>[] = [];

  public async handle(evt: INotification<INotificationBase>): Promise<void> {
    this._events.push(evt);
  }

  public count(): number {
    return this._events.length;
  }

  public lastJson(): string | undefined {
    return this._events.at(-1)?.json;
  }
}

const touchedKey = Symbol("fx.touched");
const traceKey = Symbol("fx.trace");
