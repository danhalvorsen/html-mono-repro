import { Result, Ok } from "@monorepo/core-design-patterns";
 
import { IBehavior } from "./IBehavior.js";
import { IContextPipeline } from "../Context/IContextPipeline.js";
import { IMessage } from "../Messages/IMessage.js";
import { PerformanceErr, PerformanceOk } from "./results.js";
 export const PERF_START = Symbol("perf.start");
export class PerformanceBehavior<T extends IMessage>
  implements IBehavior<T, PerformanceOk, PerformanceErr> {

  public async execute(
    ctx: IContextPipeline,
    _msg: T
  ): Promise<Result<PerformanceOk, PerformanceErr>> {
    const start = ctx.get<number>(PERF_START);
    if (!start) {
      ctx.set(PERF_START, this.nowMs());
      return Ok<PerformanceOk, PerformanceErr>({ behavior: "performance", ms: 0 });
    }

    const ms = this.nowMs() - start;
    return Ok<PerformanceOk, PerformanceErr>({ behavior: "performance", ms });
  }
   nowMs(): number {
  const p = (globalThis as any).performance;
  if (p && typeof p.now === "function") return p.now();
  return Date.now();
}
}
