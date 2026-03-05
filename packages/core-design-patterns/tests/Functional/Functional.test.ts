// packages/core-design-patterns/tests/Functional/Functional.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { EitherFixture } from '../Fixtures/EitherFixture.js'

describe("functional/either — Either", () => {

  let fx: EitherFixture;

  beforeEach(() => {
    fx = new EitherFixture();
  });

  it("Left predicates", () => {
    const e = fx.leftStringNumber();

    expect(e.isLeft()).toBe(true);
    expect(e.isRight()).toBe(false);
  });

  it("Right predicates", () => {
    const e = fx.rightNumberString();

    expect(e.isLeft()).toBe(false);
    expect(e.isRight()).toBe(true);
  });

  it("unwrap behavior", () => {
    const l = fx.leftStringNumber();
    const r = fx.rightNumberString();

    expect(l.unwrap()).toBe("err");
    expect(r.unwrap()).toBe(42);
  });

  it("Option conversions", () => {
    const l = fx.leftStringNumber();
    const r = fx.rightNumberString();

    expect(l.left().unwrap()).toBe("err");
    expect(l.right().isNone()).toBe(true);

    expect(r.left().isNone()).toBe(true);
    expect(r.right().unwrap()).toBe(42);
  });

  it("mapLeft", () => {
    const e = fx.leftMapped();

    expect(e.unwrapLeft()).toBe("ERR");
  });

  it("mapRight", () => {
    const e = fx.rightMapped();

    expect(e.unwrapRight()).toBe("42!");
  });

});