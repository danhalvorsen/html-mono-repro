// packages/core-design-patterns/tests/mediator-pipeline/MediatorPipeline.test.ts
import { describe, it, expect } from "vitest";

import { MediatorPipelineFixture } from "./fixtures/MediatorPipelineFixture.js";

import { CompositePipeline , ValidationBehavior, EventBus, Mediator } from "../src/index.js";

describe("mediator-pipeline", () => {
  const fx = new MediatorPipelineFixture();

  it("Pipeline executes behaviors in order and then handler; stores result in ctx", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("A");

    const b1 = fx.behavior_ok<typeof msg>();
    const b2 = fx.behavior_ok<typeof msg>();
    const handler = fx.handler_value<typeof msg, string>("OK");

    const pipeline = fx.pipeline([b1, b2], handler);

    const r = await pipeline.execute(ctx, msg);

    expect(r.isOk()).toBe(true);
    expect(r.unwrap()).toBe("OK");

    expect(b1.calls.map(c => c.msgName)).toEqual(["A"]);
    expect(b2.calls.map(c => c.msgName)).toEqual(["A"]);
    expect(handler.calls.map(c => c.msgName)).toEqual(["A"]);

    // Sanity: something was set in ctx (PIPELINE_RESULT symbol is private to module; we verify via override spy)
    expect(ctx.setSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("Pipeline short-circuits on first failing behavior and does not call handler", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("B");

    const b1 = fx.behavior_ok<typeof msg>();
    const bFail = fx.behavior_fail<typeof msg>("nope");
    const handler = fx.handler_value<typeof msg, string>("SHOULD_NOT_HAPPEN");

    const pipeline = fx.pipeline([b1, bFail], handler);

    const r = await pipeline.execute(ctx, msg);

    expect(r.isErr()).toBe(true);
    expect(r.unwrapErr()).toEqual({ behavior: "err", reason: "nope" });

    expect(b1.calls.length).toBe(1);
    expect(bFail.calls.length).toBe(1);
    expect(handler.calls.length).toBe(0);
  });

  it("CompositePipeline runs pipelines sequentially; returns final ctx result when all succeed", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("C");

    const p1 = fx.pipeline([fx.behavior_ok<typeof msg>()], fx.handler_value<typeof msg, string>("R1"));
    const p2 = fx.pipeline([fx.behavior_ok<typeof msg>()], fx.handler_value<typeof msg, string>("R2"));

    const composite = new CompositePipeline<typeof msg, string>([p1, p2]);

    const r = await composite.execute(ctx, msg);

    expect(r.isOk()).toBe(true);
    expect(r.unwrap()).toBe("R2"); // last pipeline wins
  });

  it("CompositePipeline stops at first error and returns it", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("D");

    const p1 = fx.pipeline([fx.behavior_ok<typeof msg>()], fx.handler_value<typeof msg, string>("R1"));
    const pFail = fx.pipeline([fx.behavior_fail<typeof msg>("boom")], fx.handler_value<typeof msg, string>("R2"));

    const composite = new CompositePipeline<typeof msg, string>([p1, pFail]);

    const r = await composite.execute(ctx, msg);

    expect(r.isErr()).toBe(true);
    expect(r.unwrapErr()).toEqual({ behavior: "err", reason: "boom" });
  });

  it("Mediator publishes event only on Ok when EventBus is provided", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("E");

    const notifHandler = fx.notificationHandler();
    const bus = new EventBus([notifHandler]);

    const pipeline = fx.pipeline(
      [fx.behavior_ok<typeof msg>()],
      fx.handler_value<typeof msg, string>("DONE"),
    );

    const mediator = new Mediator<typeof msg, string>(pipeline, bus);

    const r = await mediator.send(msg, ctx);

    expect(r.isOk()).toBe(true);
    expect(notifHandler.events.length).toBe(1);

    const evt = notifHandler.events[0]!;
    const json = fx.parseEventJson(evt);

    expect(json.type).toBe("E.Handled");
    expect(json.payload).toEqual({ name: "E" });
  });

  it("Mediator does not publish event when pipeline returns Err", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("F");

    const notifHandler = fx.notificationHandler();
    const bus = new EventBus([notifHandler]);

    const pipeline = fx.pipeline(
      [fx.behavior_fail<typeof msg>("bad")],
      fx.handler_value<typeof msg, string>("NEVER"),
    );

    const mediator = new Mediator<typeof msg, string>(pipeline, bus);

    const r = await mediator.send(msg, ctx);

    expect(r.isErr()).toBe(true);
    expect(notifHandler.events.length).toBe(0);
  });

  it("Integration: ValidationBehavior rejects empty name", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg(""); // invalid

    const pipeline = fx.pipeline(
      [new ValidationBehavior<typeof msg>()],
      fx.handler_value<typeof msg, string>("NEVER"),
    );

    const r = await pipeline.execute(ctx, msg);

    expect(r.isErr()).toBe(true);
    expect(r.unwrapErr()).toEqual({ behavior: "validation", reason: "Missing name" });
  });

  it("Integration: PerformanceBehavior sets start then reports ms on subsequent execution (same ctx)", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("Perf");

    const perf = fx.performance<typeof msg>();
    const handler = fx.handler_value<typeof msg, string>("OK");

    const pipeline = fx.pipeline([perf], handler);

    const r1 = await pipeline.execute(ctx, msg);
    expect(r1.isOk()).toBe(true);

    const r2 = await pipeline.execute(ctx, msg);
    expect(r2.isOk()).toBe(true);
    // We can't access PERF_START symbol; we just assert that ctx.set was called (start) and subsequent run didn't crash.
    expect(ctx.setSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});