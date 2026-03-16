import { Result, Ok } from "@monorepo/core-design-patterns";
 
import { IBehavior } from "./IBehavior.js";
import { IContextPipeline } from "../Context/IContextPipeline.js";
import { IMessage } from "../Messages/IMessage.js";
import { PerformanceOk } from "./results.js";

export class PerformanceBehavior<T extends IMessage>
  implements IBehavior<T, PerformanceOk, PerformanceOk> {
  private static readonly PERF_START = Symbol("perf.start");

  public async execute(
    ctx: IContextPipeline,
    _msg: T,
  ): Promise<Result<PerformanceOk, PerformanceOk>> {
    const start = ctx.get<number>(PerformanceBehavior.PERF_START);

    if (!start) {
      ctx.set(PerformanceBehavior.PERF_START, this.nowMs());
      return Ok<PerformanceOk, PerformanceOk>(new PerformanceOk(0));
    }

    const ms = this.nowMs() - start;
    return Ok<PerformanceOk, PerformanceOk>(new PerformanceOk(ms));
  }

  private nowMs(): number {
    const p = (globalThis as any).performance;

    if (p && typeof p.now === "function") {
      return p.now();
    }

    return Date.now();
  }
}
