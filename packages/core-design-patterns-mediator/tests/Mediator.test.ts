// packages/core-design-patterns/tests/Mediator.test.ts
import { describe, it, expect } from "vitest";
import { MediatorFixture } from './fixtures/MediatorFixture.js';

describe("Mediator", () => {
  it("send() returns Ok(result) and runs behaviors + handler", async () => {
    const fx = new MediatorFixture();

    const mediator = fx.createMediator({
      behaviors: [fx.createOkBehavior("b1"), fx.createOkBehavior("b2")],
      handlerResult: "SUCCESS",
    });

    const ctx = fx.createContext();
    const msg = fx.createMessage("MyMsg");

    const r = await mediator.send(msg, ctx);

    expect(r.isOk()).toBe(true);
    expect(r.unwrap()).toBe("SUCCESS");

    expect(fx.ctxTrace(ctx)).toEqual(["b1", "b2"]);
    expect(fx.ctxTouched(ctx)).toBe(true);
  });

  it("send() returns Err when a behavior fails, and does not run handler", async () => {
    const fx = new MediatorFixture();

    const mediator = fx.createMediator({
      behaviors: [fx.createOkBehavior("b1"), fx.createErrBehavior("b2", "nope"), fx.createOkBehavior("b3")],
      handlerResult: "SHOULD_NOT_HAPPEN",
    });

    const ctx = fx.createContext();
    const msg = fx.createMessage();

    const r = await mediator.send(msg, ctx);

    expect(r.isErr()).toBe(true);
    expect(r.unwrapErr()).toMatchObject({ behavior: "b2", reason: "nope" });

    // Pipeline stops at the failing behavior (b3 should not run)
    expect(fx.ctxTrace(ctx)).toEqual(["b1", "b2"]);

    // handler must not run
    expect(fx.ctxTouched(ctx)).toBe(false);
  });

  it("publishes event when pipeline result is Ok and EventBus exists", async () => {
    const fx = new MediatorFixture();

    const { mediator, recorder } = fx.createMediatorWithEvents({
      behaviors: [fx.createOkBehavior("b1")],
      handlerResult: "OK",
    });

    const ctx = fx.createContext();
    const msg = fx.createMessage("FooMessage");

    const r = await mediator.send(msg, ctx);

    expect(r.isOk()).toBe(true);

    expect(recorder.count()).toBe(1);

    const json = recorder.lastJson();
    expect(typeof json).toBe("string");

    const parsed = JSON.parse(json!);
    expect(parsed.type).toBe("FooMessage.Handled");
    expect(parsed.payload).toEqual({ name: "FooMessage" });
  });

  it("does not publish event when pipeline result is Err", async () => {
    const fx = new MediatorFixture();

    const { mediator, recorder } = fx.createMediatorWithEvents({
      behaviors: [fx.createErrBehavior("b1", "bad")],
      handlerResult: "OK",
    });

    const ctx = fx.createContext();
    const msg = fx.createMessage("FooMessage");

    const r = await mediator.send(msg, ctx);

    expect(r.isErr()).toBe(true);
    expect(r.unwrapErr()).toMatchObject({ behavior: "b1", reason: "bad" });
    expect(recorder.count()).toBe(0);
  });
});
