import { type Result, type NonUndefined, Err, Ok } from "../functional/result/result.js";
import { IMessage, IBehavior, IBehaviorResult, IHandler, PIPELINE_RESULT } from "./code.js";
import { IContextPipeline } from "./IContextPipeline.js";


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
