// tests/LoggedFsmEngine.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { LoggedFsmEngineFixture } from "./Fixtures/LoggedFsmEngineFixture.js";
import { NoTransitionError } from "../src/index.js";

describe("LoggedFsmEngine (decorator)", () => {
  let fx: LoggedFsmEngineFixture;

  beforeEach(() => {
    fx = new LoggedFsmEngineFixture();
  });

  it("logs info on successful transition (and does not change behavior)", async () => {
    const logger = fx.createLogger();
    const def = fx.createDefinition_Default();

    const inner = fx.createInnerEngine(def, { unhandled: "ignore" });
    const fsm = fx.createLoggedEngine(inner, logger, { name: "OrderFSM", verbose: false });

    const r = await fsm.dispatch({ type: fx.E.Start, payload: { inc: 5 } });

    expect(r.transitionTaken).toBe(true);
    expect(r.from).toBe(fx.S.Idle);
    expect(r.to).toBe(fx.S.Running);
    expect(r.context).toEqual({ n: 5 });

    expect(logger.count("info")).toBe(1);
    expect(
      logger.any("info", (c) =>
        /transition/i.test(c.template) &&
        c.params?.name === "OrderFSM" &&
        c.params?.from === fx.S.Idle &&
        c.params?.to === fx.S.Running &&
        c.params?.input === fx.E.Start
      )
    ).toBe(true);
  });

  it("logs warn when no transition is taken because guard blocks", async () => {
    const logger = fx.createLogger();
    const def = fx.createDefinition_GuardBlocks();

    const inner = fx.createInnerEngine(def, { unhandled: "ignore" });
    const fsm = fx.createLoggedEngine(inner, logger, { verbose: false });

    const r = await fsm.dispatch({ type: fx.E.Start, payload: { inc: 1 } });

    expect(r.transitionTaken).toBe(false);
    expect(r.from).toBe(fx.S.Idle);
    expect(r.to).toBe(fx.S.Idle);

    expect(logger.count("warn")).toBe(1);
    expect(
      logger.any("warn", (c) =>
        /no transition taken/i.test(c.template) &&
        c.params?.state === fx.S.Idle &&
        c.params?.input === fx.E.Start
      )
    ).toBe(true);
  });

  it("logs error and rethrows when inner throws (unhandled=throw)", async () => {
    const logger = fx.createLogger();
    const def = fx.createDefinition_Default();

    const inner = fx.createInnerEngine(def, { unhandled: "throw" });
    const fsm = fx.createLoggedEngine(inner, logger, { verbose: false });

    await expect(
      fsm.dispatch({ type: fx.E.Stop, payload: {} }) // Stop from Idle => unhandled => throws
    ).rejects.toBeInstanceOf(NoTransitionError);

    expect(logger.count("error")).toBe(1);
    expect(
      logger.any("error", (c) =>
        /dispatch error/i.test(c.template) &&
        c.params?.state === fx.S.Idle &&
        c.params?.input === fx.E.Stop
      )
    ).toBe(true);
  });

  it("verbose mode adds debug logs", async () => {
    const logger = fx.createLogger();
    const def = fx.createDefinition_Default();

    const inner = fx.createInnerEngine(def, { unhandled: "ignore" });
    const fsm = fx.createLoggedEngine(inner, logger, { verbose: true });

    await fsm.dispatch({ type: fx.E.Start, payload: { inc: 1 } });

    expect(logger.count("debug")).toBeGreaterThan(0);
  });
});