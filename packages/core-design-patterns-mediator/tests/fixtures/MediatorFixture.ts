// packages/core-design-patterns/tests/Fixtures/MediatorFixture.ts

import { Err, Ok, Result } from '@monorepo/core-design-patterns';
import { INotification, INotificationBase} from '@monorepo/core-design-patterns-cqrs';
import { Pipeline, EventBus, Mediator , IContextPipeline,type IMessage,type IBehavior,type IBehaviorResult, type IHandler, PipelineContext } 
    from '../../src/index.js';

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
      public async execute(ctx: IContextPipeline): Promise<Result<IBehaviorResult, IBehaviorResult>> {
        const trace = ctx.get<string[]>(thisTraceKey) ?? [];
        trace.push(tag);
        ctx.set(thisTraceKey, trace);
        return Ok({ behavior: tag });
      }
    })();
  }

  public createErrBehavior(tag: string, reason = "boom"): IBehavior<IMessage, IBehaviorResult, IBehaviorResult> {
    return new (class implements IBehavior<IMessage, IBehaviorResult, IBehaviorResult> {
      public async execute(ctx: IContextPipeline): Promise<Result<IBehaviorResult, IBehaviorResult>> {
        const trace = ctx.get<string[]>(thisTraceKey) ?? [];
        trace.push(tag);
        ctx.set(thisTraceKey, trace);
        return Err({ behavior: tag, reason } as unknown as IBehaviorResult);
      }
    })();
  }

  // ---- handler
  public createHandler(result: string): IHandler<IMessage, string> {
    return {
      async handle(ctx: IContextPipeline): Promise<string> {
        ctx.set(thisTouchedKey, true);
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
    return ctx.get<string[]>(thisTraceKey) ?? [];
  }

  public ctxTouched(ctx: PipelineContext): boolean {
    return ctx.get<boolean>(thisTouchedKey) ?? false;
  }

  // ---- internal wiring (avoid magic strings outside fixture)
  private get thisTouchedKey(): symbol {
    return this.K.touched;
  }
  private get thisTraceKey(): symbol {
    return this.K.trace;
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

// Convenience typing used by inner classes above (keeps closure clean).
const thisTouchedKey = Symbol("fx.__unused__");
const thisTraceKey = Symbol("fx.__unused__");