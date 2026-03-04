// packages/core-design-patterns/tests/Mediator/ValidationBehavior.test.ts
import { describe, it, expect } from "vitest";

import { IMessage, ValidationBehavior } from "../../../src/index.js"
// If the class is exported from code.ts instead, change to:
// import { ValidationBehavior } from "../../src/mediator-pipeline/code.js";
import { BehaviorFixture } from "../fixtures/BehaviorFixture.js";
describe("ValidationBehavior", () => {
  const fx = new BehaviorFixture();

  it("returns Ok when msg.name is non-empty", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("Foo");

    const b = new ValidationBehavior<IMessage>();

    const r = await b.execute(ctx, msg);

    expect(r.isOk()).toBe(true);
    expect(r.unwrap()).toEqual({ behavior: "validation" });
  });

  it("returns Err when msg.name is empty", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("");

    const b = new ValidationBehavior<IMessage>();

    const r = await b.execute(ctx, msg);

    expect(r.isErr()).toBe(true);
    expect(r.unwrapErr()).toEqual({ behavior: "validation", reason: "Missing name" });
  });

  it("returns Err when msg.name is undefined (defensive)", async () => {
    const ctx = fx.ctx();
    const msg = { name: undefined } as unknown as IMessage;

    const b = new ValidationBehavior<IMessage>();

    const r = await b.execute(ctx, msg);

    expect(r.isErr()).toBe(true);
    expect(r.unwrapErr()).toEqual({ behavior: "validation", reason: "Missing name" });
  });
});