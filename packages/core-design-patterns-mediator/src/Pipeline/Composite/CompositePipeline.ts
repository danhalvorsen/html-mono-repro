import { Pipeline, PIPELINE_RESULT } from "../Pipeline.js";
import { IContextPipeline } from "../Context/IContextPipeline.js";
import { Result, NonUndefined, Ok } from "@monorepo/core-design-patterns";
import { IBehaviorResult } from "../Behaviour/IBehaviorResult.js";
import { IMessage } from "../Messages/IMessage.js";

export class CompositePipeline<
  TMsg extends IMessage,
  TResult,
  TBehaviorError extends IBehaviorResult = IBehaviorResult,
> {
  public constructor(
    private readonly pipelines: ReadonlyArray<Pipeline<TMsg, TResult, TBehaviorError>>,
  ) {}

  public async execute(
    ctx: IContextPipeline,
    msg: TMsg,
  ): Promise<Result<TResult & NonUndefined, TBehaviorError & NonUndefined>> {
    for (const pipeline of this.pipelines) {
      const result = await pipeline.execute(ctx, msg);

      if (result.isErr()) {
        return result;
      }
    }

    const finalResult = ctx.get<TResult & NonUndefined>(PIPELINE_RESULT);

    if (finalResult === undefined) {
      throw new Error("CompositePipeline expected PIPELINE_RESULT to be set.");
    }

    return Ok<TResult & NonUndefined, TBehaviorError & NonUndefined>(finalResult);
  }
}
