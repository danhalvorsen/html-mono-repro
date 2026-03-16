import { IContextPipeline } from "./Context/IContextPipeline.js";
import { IBehaviorResult } from "./Behaviour/IBehaviorResult.js";
import { IMessage } from "./Messages/IMessage.js";
import { IBehavior } from "./Behaviour/IBehavior.js";
import { Err, NonUndefined, Ok, Result } from "@monorepo/core-design-patterns";
import { IHandler } from "./Handlers/IHandler.js";

export const PIPELINE_RESULT = Symbol("pipeline.result");

export class Pipeline<
  TMsg extends IMessage,
  TResult,
  TBehaviorError extends IBehaviorResult = IBehaviorResult,
> {
  public constructor(
    private readonly behaviors: ReadonlyArray<
      IBehavior<TMsg, IBehaviorResult, TBehaviorError>
    >,
    private readonly handler: IHandler<TMsg, TResult>,
  ) {}

  public async execute(
    ctx: IContextPipeline,
    msg: TMsg,
  ): Promise<Result<TResult & NonUndefined, TBehaviorError & NonUndefined>> {
    for (const behavior of this.behaviors) {
      const result = await behavior.execute(ctx, msg);

      if (result.isErr()) {
        return Err<TResult & NonUndefined, TBehaviorError & NonUndefined>(
          result.unwrapErr(),
        );
      }
    }

    const result = (await this.handler.handle(ctx, msg)) as TResult & NonUndefined;
    ctx.set(PIPELINE_RESULT, result);
    return Ok<TResult & NonUndefined, TBehaviorError & NonUndefined>(result);
  }
}
