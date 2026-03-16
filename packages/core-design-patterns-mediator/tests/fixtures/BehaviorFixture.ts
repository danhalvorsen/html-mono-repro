// packages/core-design-patterns/tests/Mediator/fixtures/BehaviorFixture.ts
import { vi, type Mock } from "vitest";

import {
  IContextPipeline,
  IMessage,
  PerformanceBehavior,
  PerformanceOk,
  PipelineContext,
  ValidationBehavior,
  ValidationErr,
  ValidationOk,
} from "../../src/index.js";

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
    return new ValidationBehavior<T>();
  }

  public performance<T extends IMessage>(): PerformanceBehavior<T> {
    return new PerformanceBehavior<T>();
  }

  public validationOk(): ValidationOk {
    return new ValidationOk();
  }

  public validationErr(reason = "Missing name"): ValidationErr {
    return new ValidationErr(reason);
  }

  public performanceOk(ms: number): PerformanceOk {
    return new PerformanceOk(ms);
  }

  /**
   * Forces nowMs() to use performance.now() and returns a restore function.
   * Provide a deterministic sequence of timestamps.
   */
  public withPerformanceNowSequence(
    ms: ReadonlyArray<number>,
  ): { restore: () => void; now: Mock<() => number> } {
    const now = vi.fn<() => number>();
    for (const value of ms) {
      now.mockReturnValueOnce(value);
    }

    (globalThis as any).performance = { now };

    return {
      now,
      restore: () => {
        (globalThis as any).performance = this.prevPerformance;
      },
    };
  }
}
