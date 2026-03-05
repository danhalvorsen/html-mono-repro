// packages/core-design-patterns/src/mediator-pipeline/code.ts

import { INotification } from "../CQRS/notification/INotification.js";
import { INotificationBase } from "../CQRS/notification/INotificationBase.js";
import type { Result } from "../functional/result/result.js";
import { Ok } from "../functional/result/result.js";
import { IContextPipeline } from "./IContextPipeline.js";
import { Mediator } from "./Mediator.js";
import { Pipeline } from "./Pipeline.js";
import { ValidationBehavior } from "./ValidationBehavior.js";
/**
 * 
 * @returns 
 */
/* ============================================================================
 * Time
 * ============================================================================ */

function nowMs(): number {
  const p = (globalThis as any).performance;
  if (p && typeof p.now === "function") return p.now();
  return Date.now();
}

/* ============================================================================
 * Messaging
 * ============================================================================ */

export interface IMessage {
  readonly name: string;
}

export class PipelineContext implements IContextPipeline {
  private readonly store = new Map<symbol, unknown>();

  public set<T>(key: symbol, value: T): void {
    this.store.set(key, value);
  }

  public get<T>(key: symbol): T | undefined {
    return this.store.get(key) as T | undefined;
  }
}

/* ============================================================================
 * Pipeline Contracts
 * ============================================================================ */

export interface IBehaviorResult {
  readonly behavior: string;
}

export interface IBehavior<
  TMsg extends IMessage,
  TResult extends IBehaviorResult,
  TError extends IBehaviorResult
> {
  execute(ctx: IContextPipeline, msg: TMsg): Promise<Result<TResult, TError>>;
}

export interface IHandler<TMsg extends IMessage, TResult> {
  handle(ctx: IContextPipeline, msg: TMsg): Promise<TResult>;
}

/* ============================================================================
 * Events (fan-out notifications)
 * ============================================================================ */

export interface INotificationHandler<TMessage extends INotificationBase> {
  handle(event: INotification<TMessage>): Promise<void>;
}

/* ============================================================================
 * Pipeline Implementations (single + composite)
 * ============================================================================ */

export const PIPELINE_RESULT = Symbol("pipeline.result");

/* ============================================================================
 * Behaviors (typed results)
 * ============================================================================ */

export type ValidationOk = { behavior: "validation" };
export type ValidationErr = { behavior: "validation"; reason: string };

export type PerformanceOk = { behavior: "performance"; ms: number };
export type PerformanceErr = { behavior: "performance"; ms: number };

const PERF_START = Symbol("perf.start");

export class PerformanceBehavior<T extends IMessage>
  implements IBehavior<T, PerformanceOk, PerformanceErr> {

  public async execute(
    ctx: IContextPipeline,
    _msg: T,
  ): Promise<Result<PerformanceOk, PerformanceErr>> {
    const start = ctx.get<number>(PERF_START);
    if (!start) {
      ctx.set(PERF_START, nowMs());
      return Ok<PerformanceOk, PerformanceErr>({ behavior: "performance", ms: 0 });
    }

    const ms = nowMs() - start;
    return Ok<PerformanceOk, PerformanceErr>({ behavior: "performance", ms });
  }
}

/* ============================================================================
 * Sample Usage
 * ============================================================================ */

export class FooMessage implements IMessage {
  public readonly name = "FooMessage";
}

export async function sampleRun(): Promise<void> {
  const handler: IHandler<FooMessage, string> = {
    async handle(): Promise<string> {
      return "SUCCESS";
    },
  };

  const pipeline = new Pipeline<FooMessage, string>(
    [
      new ValidationBehavior<FooMessage>(),
      new PerformanceBehavior<FooMessage>(),
    ],
    handler,
  );

  const mediator = new Mediator(pipeline);

  const result = await mediator.send(new FooMessage());

  if (result.isOk()) {
    // eslint-disable-next-line no-console
    console.log(result.unwrap());
  }
}

export { IContextPipeline, Pipeline };
