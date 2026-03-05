// packages/core-design-patterns/tests/Mediator/fixtures/BehaviorFixture.ts
import { vi, type Mock } from "vitest";

import { IMessage, IContextPipeline , PipelineContext, ValidationBehavior, PerformanceBehavior } from "../../../src/index.js";

export class BehaviorFixture {
  private readonly prevPerformance: unknown;

  public constructor() {
    this.prevPerformance = (globalThis as any).performance;
  }

  public ctx(): IContextPipeline {
    return new PipelineContext();
  }

  public msg(name: string): IMessage {
    return { name };
  }

  public validation<T extends IMessage>(): ValidationBehavior<T> {
    // ValidationBehavior is newable in your module (if it isn't, you already have activate() in MediatorPipelineFixture)
    return new ValidationBehavior<T>();
  }

  public performance<T extends IMessage>(): PerformanceBehavior<T> {
    return new PerformanceBehavior<T>();
  }

  /**
   * Forces nowMs() to use performance.now() and returns a restore function.
   * Provide a deterministic sequence of timestamps.
   */
  public withPerformanceNowSequence(ms: ReadonlyArray<number>): { restore: () => void; now: Mock<() => number> } {
    const now = vi.fn<() => number>();
    for (const v of ms) now.mockReturnValueOnce(v);

    (globalThis as any).performance = { now };

    return {
      now,
      restore: () => {
        (globalThis as any).performance = this.prevPerformance;
      },
    };
  }
}