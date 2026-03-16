import { afterEach, describe, expect, it } from "vitest";

import { type IMessage, PerformanceBehavior } from "../../src/index.js";
import { BehaviorFixture } from "../fixtures/BehaviorFixture.js";

describe("PerformanceBehavior", () => {
  const fx = new BehaviorFixture();

  afterEach(() => {
    const restore = fx.withPerformanceNowSequence([]).restore;
    restore();
  });

  it("returns 0 ms on first execution and stores the start time in context", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("Perf");
    const behavior = fx.performance<IMessage>();
    const perf = fx.withPerformanceNowSequence([100]);

    try {
      const result = await behavior.execute(ctx, msg);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(fx.performanceOk(0));
      expect(perf.now).toHaveBeenCalledTimes(1);
    } finally {
      perf.restore();
    }
  });

  it("returns elapsed milliseconds on the second execution with the same context", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("Perf");
    const behavior = fx.performance<IMessage>();
    const perf = fx.withPerformanceNowSequence([100, 145]);

    try {
      const first = await behavior.execute(ctx, msg);
      const second = await behavior.execute(ctx, msg);

      expect(first.isOk()).toBe(true);
      expect(first.unwrap()).toEqual(fx.performanceOk(0));
      expect(second.isOk()).toBe(true);
      expect(second.unwrap()).toEqual(fx.performanceOk(45));
      expect(perf.now).toHaveBeenCalledTimes(2);
    } finally {
      perf.restore();
    }
  });
});
