import { Result } from "@monorepo/core-design-patterns";
import { IBehaviorResult } from "./IBehaviorResult.js";
import { IContextPipeline } from "../Context/IContextPipeline.js";
import { IMessage } from "../Messages/IMessage.js";
 
export interface IBehavior<
  TMsg extends IMessage,
  TResult extends IBehaviorResult,
  TError extends IBehaviorResult
> {
  execute(ctx: IContextPipeline, msg: TMsg): Promise<Result<TResult, TError>>;
}
