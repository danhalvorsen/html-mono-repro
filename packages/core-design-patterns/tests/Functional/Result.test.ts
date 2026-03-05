// packages/core-design-patterns/tests/Functional/Result.test.ts
import { describe, it, expect, beforeEach } from "vitest";

import { createResultFixture } from '../Fixtures/ResultFixture.js'

import { Ok, Err } from "../../src/index.js";
import { isOk } from "../../src/functional/result/isOk.js";
import { isErr } from "../../src/functional/result/isErr.js";
import { ResultType } from "../../src/functional/result/ResultType.js";

describe("functional/result — Result (split files)", () => {

  let fx: ReturnType<typeof createResultFixture>;

  beforeEach(() => {
    fx = createResultFixture();
  });

  it("ResultType has stable symbols", () => {
    expect(typeof ResultType.Ok).toBe("symbol");
    expect(typeof ResultType.Err).toBe("symbol");
    expect(ResultType.Ok).not.toBe(ResultType.Err);
  });

  it("Ok: type + predicates + unwrap", () => {
    const r = fx.okString();

    expect(r.type).toBe(ResultType.Ok);
    expect(r.isOk()).toBe(true);
    expect(r.isErr()).toBe(false);

    expect(r.unwrap()).toBe("success");
    expect(() => r.unwrapErr()).toThrowError(ReferenceError);
  });

  it("Err: type + predicates + unwrapErr", () => {
    const r = fx.errString();

    expect(r.type).toBe(ResultType.Err);
    expect(r.isOk()).toBe(false);
    expect(r.isErr()).toBe(true);

    expect(r.unwrapErr()).toBe("failure");
    expect(() => r.unwrap()).toThrowError(ReferenceError);
  });

  it("ok() and err() convert to Option shapes", () => {
    const okOk = fx.okNumber().ok();
    const okErr = fx.okNumber().err();

    const errOk = fx.errString().ok();
    const errErr = fx.errString().err();

    expect(okOk.isSome()).toBe(true);
    expect(okOk.unwrap()).toBe(42);
    expect(okErr.isNone()).toBe(true);

    expect(errOk.isNone()).toBe(true);
    expect(errErr.isSome()).toBe(true);
    expect(errErr.unwrap()).toBe("failure");
  });

  it("unwrapOr returns inner value for Ok and default for Err", () => {
    expect(fx.okNumber().unwrapOr(0)).toBe(42);
    expect(fx.errString().unwrapOr(0)).toBe(0);
  });

  it("match routes to ok/err branch", () => {
    const ok = fx.okString().match({
      ok: (v: string) => `OK:${v}`,
      err: (e: string) => `ERR:${e}`,
    });

    const err = fx.errString().match({
      ok: (v: number) => `OK:${v}`,
      err: (e: string) => `ERR:${e}`,
    });

    expect(ok).toBe("OK:success");
    expect(err).toBe("ERR:failure");
  });

  it("map transforms Ok only", () => {
    const ok = fx.okNumber().map((n: number) => n + 1);
    const err = fx.errString().map((n: number) => n + 1);

    expect(ok.isOk()).toBe(true);
    expect(ok.unwrap()).toBe(43);

    expect(err.isErr()).toBe(true);
    expect(err.unwrapErr()).toBe("failure");
  });

  it("mapErr transforms Err only", () => {
    const ok = fx.okNumber().mapErr((e: string) => `E:${e}`);
    const err = fx.errString().mapErr((e: string) => `E:${e}`);

    expect(ok.isOk()).toBe(true);
    expect(ok.unwrap()).toBe(42);

    expect(err.isErr()).toBe(true);
    expect(err.unwrapErr()).toBe("E:failure");
  });

  it("andThen chains Ok and short-circuits Err", () => {
    const okChain = fx.okNumber().andThen((n: number) =>
      n > 0 ? Ok<string, string>("Y") : Err<string, string>("N")
    );

    const errChain = fx.errString().andThen((n: number) =>
      n > 0 ? Ok<string, string>("Y") : Err<string, string>("N")
    );

    expect(okChain.isOk()).toBe(true);
    expect(okChain.unwrap()).toBe("Y");

    expect(errChain.isErr()).toBe(true);
    expect(errChain.unwrapErr()).toBe("failure");
  });

  it("orElse recovers from Err and keeps Ok", () => {
    const okKeep = fx.okString().orElse((e: string) =>
      Ok<string, string>(`RECOVER:${e}`)
    );

    const errRecover = fx.errString().orElse((e: string) =>
      Ok<number, string>(e.length)
    );

    expect(okKeep.isOk()).toBe(true);
    expect(okKeep.unwrap()).toBe("success");

    expect(errRecover.isOk()).toBe(true);
    expect(errRecover.unwrap()).toBe("failure".length);
  });

  it("deprecated isOk/isErr helpers delegate to instance", () => {
    const ok = fx.okString();
    const err = fx.errString();

    expect(isOk(ok)).toBe(true);
    expect(isErr(ok)).toBe(false);

    expect(isOk(err)).toBe(false);
    expect(isErr(err)).toBe(true);
  });
});