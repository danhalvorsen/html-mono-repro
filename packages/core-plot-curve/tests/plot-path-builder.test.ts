import { describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import { PlotPathBuilder } from "../src/services/plot-path-builder.js";

describe("PlotPathBuilder", () => {
  const builder = new PlotPathBuilder();

  it("builds a valid svg path for a polyline", () => {
    const pathData = builder.buildPolylinePath([
      new Vector2(10, 20),
      new Vector2(30, 40),
      new Vector2(50, 60),
    ]);

    expect(pathData.startsWith("M ")).toBe(true);
    expect(pathData.includes(" L ")).toBe(true);
  });

  it("returns an empty string for empty input", () => {
    expect(builder.buildPolylinePath([])).toBe("");
  });
});
