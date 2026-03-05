import { INotificationBase, INotification } from "@monorepo/core-design-patterns-cqrs";
 
import { Pipeline, PIPELINE_RESULT } from "../Pipeline.js";
import { IContextPipeline } from "../Context/IContextPipeline.js";
import { Result, NonUndefined, Ok } from "@monorepo/core-design-patterns";
import { IBehaviorResult } from "../Behaviour/IBehaviorResult.js";
import { IMessage } from "../Messages/IMessage.js";

export class CompositePipeline<TMsg extends IMessage, TResult> {
  public constructor(
    private readonly pipelines: ReadonlyArray<Pipeline<TMsg, TResult>>
  ) { }

  public async execute(
    ctx: IContextPipeline,
    msg: TMsg
  ): Promise<Result<TResult & NonUndefined, IBehaviorResult & NonUndefined>> {
    for (const p of this.pipelines) {
      const r = await p.execute(ctx, msg);
      if (r.isErr()) return r;
    }

    const finalResult = ctx.get<TResult & NonUndefined>(PIPELINE_RESULT);
    // pipeline chain guarantees it was set if we got here
    return Ok<TResult & NonUndefined, IBehaviorResult & NonUndefined>(finalResult!);
  }
}
