import { describe, it, expect, beforeEach } from "vitest";
import { OptionFixture } from '../Fixtures/OptionFixture.js'

describe("functional/option — Option", () => {
  let fx: OptionFixture;

  beforeEach(() => {
    fx = new OptionFixture();
  });

  it("Some: predicates + unwrap", () => {
    const o = fx.someString();

    expect(o.isSome()).toBe(true);
    expect(o.isNone()).toBe(false);
    expect(o.unwrap()).toBe("hello");
  });

  it("None: predicates + unwrap throws", () => {
    const o = fx.noneString();

    expect(o.isSome()).toBe(false);
    expect(o.isNone()).toBe(true);
    expect(() => o.unwrap()).toThrowError(ReferenceError);
  });

  it("match: routes to correct branch for Some", () => {
    const o = fx.someNumber();

    const r = o.match({
      some: (n: number) => `S:${n}`,
      none: () => "N",
    });

    expect(r).toBe("S:42");
  });

  it("match: routes to correct branch for None (none as function)", () => {
    const o = fx.noneNumber();

    const r = o.match({
      some: (n: number) => `S:${n}`,
      none: () => "N",
    });

    expect(r).toBe("N");
  });

  it("match: routes to correct branch for None (none as value)", () => {
    const o = fx.noneNumber();

    const r = o.match({
      some: (n: number) => `S:${n}`,
      none: "N",
    });

    expect(r).toBe("N");
  });

  it("map: transforms Some and preserves None", () => {
    const s = fx.someString().map((x: string) => x.length);
    expect(s.isSome()).toBe(true);
    expect(s.unwrap()).toBe(5);

    const n = fx.noneString().map((x: string) => x.length);
    expect(n.isNone()).toBe(true);
  });

  it("andThen: chains for Some and short-circuits for None", () => {
    const s = fx.someNumber().andThen((n: number) => (n > 0 ? fx.someString() : fx.noneString()));
    expect(s.isSome()).toBe(true);
    expect(s.unwrap()).toBe("hello");

    const n = fx.noneNumber().andThen((x: number) => (x > 0 ? fx.someString() : fx.noneString()));
    expect(n.isNone()).toBe(true);
  });

  it("or: returns self for Some, fallback for None", () => {
    const a = fx.someString().or(fx.someString());
    expect(a.isSome()).toBe(true);
    expect(a.unwrap()).toBe("hello");

    const b = fx.noneString().or(fx.someString());
    expect(b.isSome()).toBe(true);
    expect(b.unwrap()).toBe("hello");
  });

  it("and: returns rhs for Some, None for None", () => {
    const a = fx.someString().and(fx.someNumber());
    expect(a.isSome()).toBe(true);
    expect(a.unwrap()).toBe(42);

    const b = fx.noneString().and(fx.someNumber());
    expect(b.isNone()).toBe(true);
  });

  it("unwrapOr: returns value for Some, default for None", () => {
    expect(fx.someNumber().unwrapOr(1)).toBe(42);
    expect(fx.noneNumber().unwrapOr(1)).toBe(1);
  });
});