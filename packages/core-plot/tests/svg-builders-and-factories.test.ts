import { describe, expect, it } from "vitest";

import { ArrowBuilder } from "../src/builders/arrow-builder.js";
import { CircleBuilder } from "../src/builders/circle-builder.js";
import { LineBuilder } from "../src/builders/line-builder.js";
import { RectangleBuilder } from "../src/builders/rectangle-builder.js";
import { AxisVisualFactory } from "../src/factories/axis-visual-factory.js";

describe("SVG builders and factories", () => {
  it("should build immutable svg primitive objects", () => {
    const line = new LineBuilder()
      .withPoints(1, 2, 3, 4)
      .withStyle({ stroke: "#fff", strokeWidth: 2, state: "normal" })
      .build();

    expect(line.x1).toBe(1);
    expect(line.x2).toBe(3);
    expect(line.style.stroke).toBe("#fff");
    expect(Object.isFrozen(line.style)).toBe(true);
  });

  it("should build circle, rectangle, and arrow primitives", () => {
    const circle = new CircleBuilder()
      .withCenter(10, 12)
      .withRadius(6)
      .withStyle({ fill: "#123", state: "normal" })
      .build();
    const rectangle = new RectangleBuilder()
      .withBounds(4, 5, 100, 24)
      .withCornerRadius(8)
      .withStyle({ fill: "#456", stroke: "#789", state: "highlighted" })
      .build();
    const arrow = new ArrowBuilder()
      .withPoints(8, 8, 2, 4, 2, 12)
      .withStyle({ stroke: "#abc", state: "normal" })
      .build();

    expect(circle.r).toBe(6);
    expect(rectangle.rx).toBe(8);
    expect(arrow.tipX).toBe(8);
  });

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
    expect(horizontal.arrows[0]?.tipX).toBe(80);
    expect(horizontal.arrows[1]?.tipX).toBe(500);
    expect(horizontal.arrows[0]?.leftX).toBe(92);
    expect(horizontal.arrows[1]?.leftX).toBe(488);

    expect(vertical.arrows).toHaveLength(2);
    expect(vertical.arrows[0]?.tipY).toBe(60);
    expect(vertical.arrows[1]?.tipY).toBe(420);
    expect(vertical.arrows[0]?.leftY).toBe(72);
    expect(vertical.arrows[1]?.leftY).toBe(408);
  });
});
