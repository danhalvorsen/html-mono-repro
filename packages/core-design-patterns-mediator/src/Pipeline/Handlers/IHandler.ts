import { IContextPipeline } from "../Context/IContextPipeline.js";

export interface IHandler<TMsg, TResult> {
  handle(ctx: IContextPipeline, msg: TMsg): Promise<TResult>;
}
