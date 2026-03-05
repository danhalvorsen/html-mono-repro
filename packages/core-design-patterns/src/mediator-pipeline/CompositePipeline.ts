import { type Result, type NonUndefined, Ok } from "../functional/result/result.js";
import { IMessage, IBehaviorResult, PIPELINE_RESULT } from "./code.js";
import { IContextPipeline } from "./IContextPipeline.js";
import { Pipeline } from "./Pipeline.js";


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
