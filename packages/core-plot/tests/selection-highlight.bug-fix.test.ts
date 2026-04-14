import { describe, expect, it } from "vitest";

import { Axis } from "../src/coordinates/axis.js";
import { AxisRange } from "../src/coordinates/axis-range.js";
import { CoordinateSystem } from "../src/coordinates/coordinate-system.js";
import { Point } from "../src/domain/point.js";
import type { RenderContext } from "../src/core/render-context.js";

describe("selection highlight bug fix", () => {
  it("should render highlighted axis visuals when the axis is selected", () => {
    const axis = new Axis("axis-1", "horizontal", new AxisRange(-2, 2));
    axis.setLayout({
      startX: 80,
      startY: 200,
      endX: 500,
      endY: 200,
      zeroX: 290,
      zeroY: 200,
      tickValues: [-2, 0, 2],
    });

    const renderContext: RenderContext = {
      width: 840,
      height: 520,
      selectedObjectId: "axis-1",
    };

    const rendered = JSON.stringify(axis.render(renderContext).values);
    expect(rendered.includes("#f59f46")).toBe(true);
  });

  it("should render highlighted coordinate-system visuals when the coordinate system is selected", () => {
    const host = {
      addController() {},
      removeController() {},
      requestUpdate() {},
    };
    const coordinateSystem = new CoordinateSystem(
      host,
      "cs-1",
      [new Point(0, 0, "A")],
    );

    const renderContext: RenderContext = {
      width: 840,
      height: 520,
      selectedObjectId: "cs-1",
    };

    const rendered = JSON.stringify(coordinateSystem.render(renderContext).values);
    expect(rendered.includes("#f59f46")).toBe(true);
  });
});
