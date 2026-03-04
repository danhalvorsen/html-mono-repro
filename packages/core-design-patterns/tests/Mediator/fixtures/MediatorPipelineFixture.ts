// packages/core-design-patterns/tests/mediator-pipeline/fixtures/MediatorPipelineFixture.ts
import { vi } from "vitest";

import type { Result } from "../../../src/functional/result/result.js";
import { Ok, Err } from "../../../src/functional/result/result.js";

import type {
  IMessage,
  IBehavior,
  IBehaviorResult,
  IHandler,
  IContextPipeline,
} from "../../../src/mediator-pipeline/index.js";

import {
  PipelineContext,
  Pipeline,
  CompositePipeline,
  Mediator,
  EventBus,
  ValidationBehavior,
  PerformanceBehavior,
} from "../../../src/mediator-pipeline/index.js";

import type { INotification } from "../../../src/CQRS/notification/INotification.js";
import type { INotificationBase } from "../../../src/CQRS/notification/INotificationBase.js";
import type { INotificationHandler } from "../../../src/mediator-pipeline/code.js";

type AnyOk = IBehaviorResult & { behavior: "ok" };
type AnyErr = IBehaviorResult & { behavior: "err"; reason: string };

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
  implements IBehavior<TMsg, AnyOk, AnyErr>
{
  public readonly calls: Array<{ msgName: string }> = [];
  public constructor(private readonly fail?: { reason: string }) {}

  public async execute(_ctx: IContextPipeline, msg: TMsg): Promise<Result<AnyOk, AnyErr>> {
    this.calls.push({ msgName: msg.name });
    if (this.fail) return Err<AnyOk, AnyErr>({ behavior: "err", reason: this.fail.reason });
    return Ok<AnyOk, AnyErr>({ behavior: "ok" });
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