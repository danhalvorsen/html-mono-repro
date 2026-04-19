import { describe, expect, it } from "vitest";
import {
  createSvgStyleResolver,
  resolveSvgStrokeFillStyle,
  svgStrokeFillStyleFromCoreStyle,
} from "../src/style/svg-style-system.js";

describe("svg style system", () => {
  it("resolves core style-system tokens into SVG stroke/fill style", () => {
    const resolver = createSvgStyleResolver({
      "meter-face": {
        name: "meter-face",
        extends: ["surface"],
        style: {
          fill: { color: "#123456" },
          stroke: { color: "#abcdef", width: 3, dash: [2, 4] },
          opacity: 0.8,
        },
      },
    });

    expect(resolveSvgStrokeFillStyle(resolver, { token: "meter-face" })).toEqual({
      fill: "#123456",
      stroke: "#abcdef",
      strokeWidth: 3,
      strokeDasharray: "2 4",
      opacity: 0.8,
    });
  });

  it("maps core style overrides without requiring a token", () => {
    expect(
      svgStrokeFillStyleFromCoreStyle({
        fill: { color: "#ffffff" },
        stroke: { color: "#111111", width: 2 },
      }),
    ).toEqual({
      fill: "#ffffff",
      stroke: "#111111",
      strokeWidth: 2,
    });
  });
});
