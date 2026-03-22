 import { describe, expect, it } from "vitest";

import {
  StyleResolver,
  type IStyle,
} from "../../src/index.js";
import { StyleResolverFixture } from "./StyleResolverFixture.js";

describe("StyleResolver", () => {
  it("should return an empty style when no reference is provided", () => {
    const fixture = new StyleResolverFixture();

    const actual = fixture.defaultResolver.resolve();

    expect(actual).toEqual({});
  });

  it("should resolve a direct token", () => {
    const fixture = new StyleResolverFixture();
    const library = fixture.createLibrary(fixture.createTokens());
    const resolver = fixture.createResolver(library);

    const actual = resolver.resolve({ token: "base" });

    expect(actual).toEqual({
      stroke: {
        color: "black",
        width: 1,
        dash: [],
      },
      fill: {
        color: "white",
      },
      opacity: 1,
    } satisfies IStyle);
  });

  it("should resolve inherited tokens", () => {
    const fixture = new StyleResolverFixture();
    const library = fixture.createLibrary(fixture.createTokens());
    const resolver = fixture.createResolver(library);

    const actual = resolver.resolve({ token: "emphasis" });

    expect(actual).toEqual({
      stroke: {
        color: "red",
        width: 1,
        dash: [],
      },
      fill: {
        color: "yellow",
      },
      opacity: 0.75,
    } satisfies IStyle);
  });

  it("should merge overrides over a resolved token", () => {
    const fixture = new StyleResolverFixture();
    const library = fixture.createLibrary(fixture.createOverrideTokens());
    const resolver = fixture.createResolver(library);

    const actual = resolver.resolve({
      token: "shared",
      overrides: {
        stroke: {
          width: 5,
        },
        opacity: 0.25,
      },
    });

    expect(actual).toEqual({
      stroke: {
        color: "blue",
        width: 5,
      },
      fill: {
        color: "lightblue",
      },
      opacity: 0.25,
    } satisfies IStyle);
  });

  it("should resolve overrides without a token", () => {
    const fixture = new StyleResolverFixture();

    const actual = fixture.defaultResolver.resolve({
      overrides: {
        stroke: {
          color: "green",
        },
        opacity: 0.6,
      },
    });

    expect(actual).toEqual({
      stroke: {
        color: "green",
      },
      opacity: 0.6,
    } satisfies IStyle);
  });

  it("should use the last library when the same token exists in multiple libraries", () => {
    const fixture = new StyleResolverFixture();

    const baseLibrary = fixture.createLibrary({
      shared: {
        name: "shared",
        style: {
          stroke: {
            color: "black",
            width: 1,
          },
        },
      },
    });

    const overridingLibrary = fixture.createLibrary({
      shared: {
        name: "shared",
        style: {
          stroke: {
            color: "purple",
            width: 3,
          },
          opacity: 0.4,
        },
      },
    });

    const resolver = fixture.createResolver(baseLibrary, overridingLibrary);

    const actual = resolver.resolve({ token: "shared" });

    expect(actual).toEqual({
      stroke: {
        color: "purple",
        width: 3,
      },
      opacity: 0.4,
    } satisfies IStyle);
  });

  it("should throw when token does not exist", () => {
    const fixture = new StyleResolverFixture();

    expect(() => fixture.defaultResolver.resolve({ token: "missing-token" }))
      .toThrowError("Unknown style token 'missing-token'.");
  });

  it("should throw when token inheritance is circular", () => {
    const fixture = new StyleResolverFixture();
    const library = fixture.createLibrary(fixture.createCircularTokens());
    const resolver = fixture.createResolver(library);

    expect(() => resolver.resolve({ token: "a" }))
      .toThrowError("Circular style token inheritance detected for 'a'.");
  });

  it("should preserve inherited stroke members when override changes only one member", () => {
    const fixture = new StyleResolverFixture();
    const library = fixture.createLibrary(fixture.createTokens());
    const resolver = fixture.createResolver(library);

    const actual = resolver.resolve({
      token: "dashed",
      overrides: {
        stroke: {
          width: 8,
        },
      },
    });

    expect(actual).toEqual({
      stroke: {
        color: "black",
        width: 8,
        dash: [4, 2],
      },
      fill: {
        color: "white",
      },
      opacity: 1,
    } satisfies IStyle);
  });

  it("should omit undefined members from the result", () => {
    const resolver = new StyleResolver([]);

    const actual = resolver.resolve({
      overrides: {
        stroke: {
          color: "orange",
        },
      },
    });

    expect(actual).toEqual({
      stroke: {
        color: "orange",
      },
    });

    expect("fill" in actual).toBe(false);
    expect("opacity" in actual).toBe(false);
    expect(actual.stroke).toBeDefined();
    expect("width" in (actual.stroke ?? {})).toBe(false);
    expect("dash" in (actual.stroke ?? {})).toBe(false);
  });
});
