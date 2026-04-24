// packages/core-design-patterns-mediator/src/Pipeline/PipelineBuilder.ts

import type { NonUndefined } from '@monorepo/core-design-patterns';
import {
  Pipeline,
  PIPELINE_RESULT,
} from './Pipeline.js';
import type { IBehavior } from './Behaviour/IBehavior.js';
import type { IBehaviorResult } from './Behaviour/IBehaviorResult.js';
import type { IContextPipeline } from './Context/IContextPipeline.js';
import type { IHandler } from './Handlers/IHandler.js';
import type { IMessage } from './Messages/IMessage.js';

class PipelineResultRecordingHandler<
  TMsg extends IMessage,
  TResult,
> implements IHandler<TMsg, TResult> {
  public constructor(
    private readonly inner: IHandler<TMsg, TResult>,
  ) {}

  public async handle(
    ctx: IContextPipeline,
    msg: TMsg,
  ): Promise<TResult> {
    const result = await this.inner.handle(ctx, msg);
    ctx.set<TResult & NonUndefined>(
      PIPELINE_RESULT,
      result as TResult & NonUndefined,
    );
    return result;
  }
}

export class PipelineBuilder<
  TMsg extends IMessage,
  TResult,
  TError extends IBehaviorResult = IBehaviorResult,
> {
  private readonly behaviors: Array<IBehavior<TMsg, IBehaviorResult, TError>> = [];
  private handler?: IHandler<TMsg, TResult>;

  public withBehavior(
    behavior: IBehavior<TMsg, IBehaviorResult, TError>,
  ): this {
    this.behaviors.push(behavior);
    return this;
  }

  public withHandler(
    handler: IHandler<TMsg, TResult>,
  ): this {
    this.handler = handler;
    return this;
  }

  public build(): Pipeline<TMsg, TResult, TError> {
    if (this.handler === undefined) {
      throw new Error('PipelineBuilder: handler is required.');
    }

    return new Pipeline<TMsg, TResult, TError>(
      this.behaviors,
      new PipelineResultRecordingHandler<TMsg, TResult>(this.handler),
    );
  }
}