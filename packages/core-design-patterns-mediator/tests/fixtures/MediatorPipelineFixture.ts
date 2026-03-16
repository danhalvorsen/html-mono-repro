// packages/core-design-patterns/tests/mediator-pipeline/fixtures/MediatorPipelineFixture.ts
import { vi } from "vitest";
import { Err, Ok, Result } from "@monorepo/core-design-patterns";
import {
  EventBus,
  IBehavior,
  IBehaviorResult,
  IContextPipeline,
  IHandler,
  IMessage,
  INotificationHandler,
  Mediator,
  PerformanceBehavior,
  Pipeline,
  PipelineContext,
  ValidationBehavior,
} from '../../src/index.js'
import { INotificationBase, INotification } from "@monorepo/core-design-patterns-cqrs";

class FixtureOkResult implements IBehaviorResult {
  public readonly behavior = "ok";
}

class FixtureErrResult implements IBehaviorResult {
  public readonly behavior = "err";

  public constructor(public readonly reason: string) {}
}

export class TestMessage implements IMessage {
  public constructor(public readonly name: string) {}
}

export class RecordingContext extends PipelineContext {
  public readonly setSpy = vi.fn<(key: symbol, value: unknown) => void>();

  public override set<T>(key: symbol, value: T): void {
    this.setSpy(key, value);
    super.set(key, value);
  }
}

export class RecordingBehavior<TMsg extends IMessage>
  implements IBehavior<TMsg, FixtureOkResult, FixtureErrResult>
{
  public readonly calls: Array<{ msgName: string }> = [];
  public constructor(private readonly fail?: { reason: string }) {}

  public async execute(
    _ctx: IContextPipeline,
    msg: TMsg,
  ): Promise<Result<FixtureOkResult, FixtureErrResult>> {
    this.calls.push({ msgName: msg.name });

    if (this.fail) {
      return Err<FixtureOkResult, FixtureErrResult>(
        new FixtureErrResult(this.fail.reason),
      );
    }

    return Ok<FixtureOkResult, FixtureErrResult>(new FixtureOkResult());
  }
}

export class RecordingHandler<TMsg extends IMessage, TResult>
  implements IHandler<TMsg, TResult>
{
  public readonly calls: Array<{ msgName: string }> = [];
  public constructor(private readonly valueFactory: (msg: TMsg) => TResult) {}

  public async handle(_ctx: IContextPipeline, msg: TMsg): Promise<TResult> {
    this.calls.push({ msgName: msg.name });
    return this.valueFactory(msg);
  }
}

export class RecordingNotificationHandler implements INotificationHandler<INotificationBase> {
  public readonly events: Array<INotification<INotificationBase>> = [];
  public async handle(event: INotification<INotificationBase>): Promise<void> {
    this.events.push(event);
  }
}

export class MediatorPipelineFixture {
  public msg(name = "TestMessage"): TestMessage {
    return new TestMessage(name);
  }

  public ctx(): RecordingContext {
    return new RecordingContext();
  }

  public behavior_ok<TMsg extends IMessage>(): RecordingBehavior<TMsg> {
    return new RecordingBehavior<TMsg>();
  }

  public behavior_fail<TMsg extends IMessage>(reason = "fail"): RecordingBehavior<TMsg> {
    return new RecordingBehavior<TMsg>({ reason });
  }

  public err(reason: string): IBehaviorResult {
    return new FixtureErrResult(reason);
  }

  public handler_value<TMsg extends IMessage, TResult>(value: TResult): RecordingHandler<TMsg, TResult> {
    return new RecordingHandler<TMsg, TResult>(() => value);
  }

  public handler_from<TMsg extends IMessage, TResult>(
    factory: (msg: TMsg) => TResult,
  ): RecordingHandler<TMsg, TResult> {
    return new RecordingHandler<TMsg, TResult>(factory);
  }

  public pipeline<TMsg extends IMessage, TResult>(
    behaviors: ReadonlyArray<IBehavior<TMsg, IBehaviorResult, IBehaviorResult>>,
    handler: IHandler<TMsg, TResult>,
  ): Pipeline<TMsg, TResult> {
    return new Pipeline<TMsg, TResult>(behaviors, handler);
  }

  public composite<TMsg extends IMessage, TResult>(
    ...pipelines: Array<Pipeline<TMsg, TResult>>
  ): CompositePipeline<TMsg, TResult> {
    return new CompositePipeline<TMsg, TResult>(pipelines);
  }

  public eventsBus(...handlers: INotificationHandler<INotificationBase>[]): EventBus {
    return new EventBus(handlers);
  }

  public notificationHandler(): RecordingNotificationHandler {
    return new RecordingNotificationHandler();
  }

  public mediator<TMsg extends IMessage, TResult>(
    pipeline: Pipeline<TMsg, TResult>,
    events?: EventBus,
  ): Mediator<TMsg, TResult> {
    return new Mediator<TMsg, TResult>(pipeline, events);
  }

  public validation<TMsg extends IMessage>(): ValidationBehavior<TMsg> {
    return new ValidationBehavior<TMsg>();
  }

  public performance<TMsg extends IMessage>(): PerformanceBehavior<TMsg> {
    return new PerformanceBehavior<TMsg>();
  }

  public parseEventJson(evt: INotification<INotificationBase>): any {
    return JSON.parse(evt.json);
  }
}
