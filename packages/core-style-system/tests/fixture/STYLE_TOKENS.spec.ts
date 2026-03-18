 import { describe, expect, it } from "vitest";

import {
  STYLE_TOKENS,
  StyleLibrary,
  StyleResolver,
} from "../../src/index.js";

describe("STYLE_TOKENS", () => {
  it("should contain the expected built-in token names", () => {
    expect(Object.keys(STYLE_TOKENS)).toEqual([
      "base",
      "grid",
      "axis",
      "line",
      "surface",
      "vertex",
      "circle-primary",
    ]);
  });

  it("should resolve the built-in base token", () => {
    const resolver = new StyleResolver([
      new StyleLibrary(STYLE_TOKENS),
    ]);

    const actual = resolver.resolve({ token: "base" });

    expect(actual).toEqual({
      stroke: {
        color: "transparent",
        width: 1,
        dash: [],
      },
      fill: {
        color: "transparent",
      },
      opacity: 1,
    });
  });

  it("should resolve the built-in circle-primary token with inheritance", () => {
    const resolver = new StyleResolver([
      new StyleLibrary(STYLE_TOKENS),
    ]);

    const actual = resolver.resolve({ token: "circle-primary" });

    expect(actual).toEqual({
      stroke: {
        color: "#0f766e",
        width: 2,
        dash: [],
      },
      fill: {
        color: "rgba(15, 118, 110, 0.18)",
      },
      opacity: 1,
    });
  });

  it("should resolve the built-in vertex token", () => {
    const resolver = new StyleResolver([
      new StyleLibrary(STYLE_TOKENS),
    ]);

    const actual = resolver.resolve({ token: "vertex" });

    expect(actual).toEqual({
      stroke: {
        color: "#0f172a",
        width: 1,
        dash: [],
      },
      fill: {
        color: "#0f172a",
      },
      opacity: 1,
    });
  });
});
