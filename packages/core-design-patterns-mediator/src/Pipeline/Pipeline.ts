 
import { IContextPipeline } from "./Context/IContextPipeline.js";
import { IBehaviorResult } from "./Behaviour/IBehaviorResult.js";
import { IMessage } from "./Messages/IMessage.js";
import { IBehavior } from "./Behaviour/IBehavior.js";
import { Err, NonUndefined, Ok, Result } from "@monorepo/core-design-patterns";
import { IHandler } from "./Handlers/IHandler.js";
 
export const PIPELINE_RESULT = Symbol("pipeline.result");

export class Pipeline<TMsg extends IMessage, TResult> {
  public constructor(
    private readonly behaviors: ReadonlyArray<IBehavior<TMsg, IBehaviorResult, IBehaviorResult>>,
    private readonly handler: IHandler<TMsg, TResult>
  ) { }

  public async execute(
    ctx: IContextPipeline,
    msg: TMsg
  ): Promise<Result<TResult & NonUndefined, IBehaviorResult & NonUndefined>> {
    for (const b of this.behaviors) {
      const r = await b.execute(ctx, msg);
      if (r.isErr()) return Err<TResult & NonUndefined, IBehaviorResult & NonUndefined>(r.unwrapErr() as any);
    }

    const result = (await this.handler.handle(ctx, msg)) as TResult & NonUndefined;
    ctx.set(PIPELINE_RESULT, result);
    return Ok<TResult & NonUndefined, IBehaviorResult & NonUndefined>(result);
  }
}
