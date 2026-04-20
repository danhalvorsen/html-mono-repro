import { Err, Ok, Result } from '@monorepo/core-design-patterns';
import { vi } from 'vitest';
import {
  IBehavior,
  IBehaviorResult,
  IContextPipeline,
  IHandler,
  IMessage,
  PipelineBuilder,
  PipelineContext,
} from '../../src/index.js';
export class BuilderFixtureOk implements IBehaviorResult {
  public readonly behavior = 'ok';
}

export class BuilderFixtureErr implements IBehaviorResult {
  public readonly behavior = 'err';

  public constructor(
    public readonly reason: string,
  ) {}
}

export class BuilderFixtureMessage implements IMessage {
  public constructor(
    public readonly name: string = 'BuilderFixtureMessage',
  ) {}
}

export class BuilderFixtureContext extends PipelineContext {
  public readonly setSpy = vi.fn<(key: symbol, value: unknown) => void>();

  public override set<T>(key: symbol, value: T): void {
    this.setSpy(key, value);
    super.set(key, value);
  }
}

export class BuilderFixtureBehavior<TMsg extends IMessage>
  implements IBehavior<TMsg, BuilderFixtureOk, BuilderFixtureErr>
{
  public readonly calls: Array<{ msgName: string }> = [];

  public constructor(
    private readonly failReason?: string,
  ) {}

  public async execute(
    _ctx: IContextPipeline,
    msg: TMsg,
  ): Promise<Result<BuilderFixtureOk, BuilderFixtureErr>> {
    this.calls.push({ msgName: msg.name });

    if (this.failReason) {
      return Err<BuilderFixtureOk, BuilderFixtureErr>(
        new BuilderFixtureErr(this.failReason),
      );
    }

    return Ok<BuilderFixtureOk, BuilderFixtureErr>(
      new BuilderFixtureOk(),
    );
  }
}

export class BuilderFixtureHandler<TMsg extends IMessage, TResult>
  implements IHandler<TMsg, TResult>
{
  public readonly calls: Array<{ msgName: string }> = [];

  public constructor(
    private readonly factory: (msg: TMsg) => TResult,
  ) {}

  public async handle(
    _ctx: IContextPipeline,
    msg: TMsg,
  ): Promise<TResult> {
    this.calls.push({ msgName: msg.name });
    return this.factory(msg);
  }
}

export class PipelineBuilderFixture {
  public msg(name = 'BuilderFixtureMessage'): BuilderFixtureMessage {
    return new BuilderFixtureMessage(name);
  }

  public ctx(): BuilderFixtureContext {
    return new BuilderFixtureContext();
  }

  public behavior_ok<TMsg extends IMessage>(): BuilderFixtureBehavior<TMsg> {
    return new BuilderFixtureBehavior<TMsg>();
  }

  public behavior_fail<TMsg extends IMessage>(
    reason = 'behavior failed',
  ): BuilderFixtureBehavior<TMsg> {
    return new BuilderFixtureBehavior<TMsg>(reason);
  }

  public handler_value<TMsg extends IMessage, TResult>(
    value: TResult,
  ): BuilderFixtureHandler<TMsg, TResult> {
    return new BuilderFixtureHandler<TMsg, TResult>(() => value);
  }

  public handler_from<TMsg extends IMessage, TResult>(
    factory: (msg: TMsg) => TResult,
  ): BuilderFixtureHandler<TMsg, TResult> {
    return new BuilderFixtureHandler<TMsg, TResult>(factory);
  }

  public builder<TMsg extends IMessage, TResult>(): PipelineBuilder<
    TMsg,
    TResult,
    IBehaviorResult
  > {
    return new PipelineBuilder<TMsg, TResult, IBehaviorResult>();
  }
}