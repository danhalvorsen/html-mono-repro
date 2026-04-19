import { describe, expect, it } from "vitest";

import { AxisVisualFactory } from "../src/factories/axis-visual-factory.js";

describe("AxisVisualFactory", () => {
  it("should compose axis visuals from primitives and ticks", () => {
    const visual = new AxisVisualFactory().create({
      orientation: "horizontal",
      startX: 80,
      startY: 200,
      endX: 500,
      endY: 200,
      zeroX: 290,
      zeroY: 200,
      tickValues: [-2, -1, 0, 1, 2],
      rangeMin: -2,
      rangeMax: 2,
      highlighted: false,
    });

    expect(visual.line).toBeDefined();
    expect(visual.arrows).toHaveLength(2);
    expect(visual.ticks).toHaveLength(5);
  });

  it("should create horizontal axis arrows on both sides and rotate them for vertical axes", () => {
    const factory = new AxisVisualFactory();
    const horizontal = factory.create({
      orientation: "horizontal",
      startX: 80,
      startY: 200,
      endX: 500,
      endY: 200,
      zeroX: 290,
      zeroY: 200,
      tickValues: [-2, 0, 2],
      rangeMin: -2,
      rangeMax: 2,
      highlighted: false,
    });
    const vertical = factory.create({
      orientation: "vertical",
      startX: 300,
      startY: 60,
      endX: 300,
      endY: 420,
      zeroX: 300,
      zeroY: 240,
      tickValues: [-2, 0, 2],
      rangeMin: -2,
      rangeMax: 2,
      highlighted: false,
    });

    expect(horizontal.arrows).toHaveLength(2);
    expect(horizontal.arrows[0]?.tip.x).toBe(80);
    expect(horizontal.arrows[1]?.tip.x).toBe(500);
    expect(horizontal.arrows[0]?.left.x).toBe(92);
    expect(horizontal.arrows[1]?.left.x).toBe(488);

    expect(vertical.arrows).toHaveLength(2);
    expect(vertical.arrows[0]?.tip.y).toBe(60);
    expect(vertical.arrows[1]?.tip.y).toBe(420);
    expect(vertical.arrows[0]?.left.y).toBe(72);
    expect(vertical.arrows[1]?.left.y).toBe(408);
  });
});
