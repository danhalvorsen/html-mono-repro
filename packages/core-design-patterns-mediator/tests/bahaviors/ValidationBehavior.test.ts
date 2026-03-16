// packages/core-design-patterns/tests/Mediator/ValidationBehavior.test.ts
import { describe, it, expect } from "vitest";
import { BehaviorFixture } from "../fixtures/BehaviorFixture.js";
import {
  IMessage,
  ValidationErr,
  ValidationOk,
} from '../../src/index.js';

describe("ValidationBehavior", () => {
  const fx = new BehaviorFixture();

  it("returns Ok when msg.name is non-empty", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("Foo");

    const b = fx.validation<IMessage>();

    const r = await b.execute(ctx, msg);

    expect(r.isOk()).toBe(true);
    expect(r.unwrap()).toBeInstanceOf(ValidationOk);
    expect(r.unwrap()).toEqual(fx.validationOk());
  });

  it("returns Err when msg.name is empty", async () => {
    const ctx = fx.ctx();
    const msg = fx.msg("");

    const b = fx.validation<IMessage>();

    const r = await b.execute(ctx, msg);

    expect(r.isErr()).toBe(true);
    expect(r.unwrapErr()).toBeInstanceOf(ValidationErr);
    expect(r.unwrapErr()).toEqual(fx.validationErr());
  });

  it("returns Err when msg.name is undefined (defensive)", async () => {
    const ctx = fx.ctx();
    const msg = { name: undefined } as unknown as IMessage;

    const b = fx.validation<IMessage>();

    const r = await b.execute(ctx, msg);

    expect(r.isErr()).toBe(true);
    expect(r.unwrapErr()).toEqual(fx.validationErr());
  });
});
