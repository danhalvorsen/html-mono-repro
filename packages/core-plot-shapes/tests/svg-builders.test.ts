import { describe, expect, it } from "vitest";

import { ArrowBuilder } from "../src/builders/arrow-builder.js";
import { CanvasObjectBuilder } from "../src/builders/canvas-object-builder.js";
import { CircleBuilder } from "../src/builders/circle-builder.js";
import { CoordinatePointBuilder } from "../src/builders/coordinate-point-builder.js";
import { CurveBuilder } from "../src/builders/curve-builder.js";
import { LabelBuilder } from "../src/builders/label-builder.js";
import { LineBuilder } from "../src/builders/line-builder.js";
import { RectangleBuilder } from "../src/builders/rectangle-builder.js";
import { TickBuilder } from "../src/builders/tick-builder.js";

describe("SVG builders", () => {
  it("should build immutable svg primitive objects", () => {
    const line = new LineBuilder()
      .withPoints(1, 2, 3, 4)
      .withStyle({ stroke: "#fff", strokeWidth: 2, state: "normal" })
      .build();

    expect(line.start.x).toBe(1);
    expect(line.end.x).toBe(3);
    expect(line.style.stroke).toBe("#fff");
    expect(Object.isFrozen(line.style)).toBe(true);
    expect(line.getStyle().stroke).toBe("#fff");

    const highlighted = line.withStylePatch({ state: "highlighted", stroke: "#0ff" });

    expect(highlighted.style.state).toBe("highlighted");
    expect(highlighted.style.stroke).toBe("#0ff");
    expect(line.style.state).toBe("normal");
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

    expect(circle.center.x).toBe(10);
    expect(circle.r).toBe(6);
    expect(rectangle.rx).toBe(8);
    expect(arrow.tip.x).toBe(8);
    expect(rectangle.style.token).toBeUndefined();
  });

  it("should compose a coordinate point from a circle and a label", () => {
    const circle = new CircleBuilder()
      .withCenter(10, 12)
      .withRadius(6)
      .withStyle({ fill: "#123", state: "normal" })
      .build();
    const label = new LabelBuilder()
      .withPosition({ x: 22, y: 4 })
      .withText("A (1, 2)")
      .withAnchor("start")
      .withFill("#456")
      .withFontFamily("monospace")
      .withFontSize(12)
      .withVisibility(true)
      .build();
    const point = new CoordinatePointBuilder()
      .withCircle(circle)
      .withLabel(label)
      .withLabelVisibility(false)
      .build();

    expect(point.circle).toBe(circle);
    expect(point.label).toBe(label);
    expect(point.labelVisible).toBe(false);
    expect(label.position.x).toBe(22);
    expect(label.position.y).toBe(4);
    expect(label.style.fontFamily).toBe("monospace");
  });

  it("should compose a canvas border with round or straight corners and preserve style tokens", () => {
    const rounded = new CanvasObjectBuilder()
      .withBounds({ x: 4, y: 5, width: 100, height: 24 })
      .withStyle({ fill: "#456", stroke: "#789", token: "canvas-border" })
      .withCorners("round")
      .withCornerRadius(12)
      .build();
    const straight = new CanvasObjectBuilder()
      .withBounds({ x: 4, y: 5, width: 100, height: 24 })
      .withStyle({ fill: "#456", stroke: "#789", token: "canvas-border" })
      .withCorners("straight")
      .withCornerRadius(12)
      .build();

    expect(rounded.border.rx).toBe(12);
    expect(straight.border.rx).toBe(0);
    expect(rounded.border.style.token).toBe("canvas-border");
  });

  it("should create a curve svg shape with path data and style tokens", () => {
    const curve = new CurveBuilder()
      .withPathData("M 0 0 L 10 10 L 20 5")
      .withStyle({ stroke: "#abc", strokeWidth: 2, token: "curve-primary" })
      .withLineCap("round")
      .withLineJoin("round")
      .build();

    expect(curve.pathData).toBe("M 0 0 L 10 10 L 20 5");
    expect(curve.style.token).toBe("curve-primary");
    expect(curve.lineCap).toBe("round");
    expect(curve.lineJoin).toBe("round");
  });

  it("should build tick svg objects from line and label data", () => {
    const line = new LineBuilder()
      .withPoints(10, 20, 10, 34)
      .withStyle({ stroke: "#999", strokeWidth: 1 })
      .build();
    const tick = new TickBuilder()
      .withLine(line)
      .withLabelPosition({ x: 10, y: 44 })
      .withLabel("0")
      .withAnchor("middle")
      .withFill("#555")
      .withFontFamily("monospace")
      .build();

    expect(tick.line).toBe(line);
    expect(tick.labelPosition.x).toBe(10);
    expect(tick.label).toBe("0");
    expect(tick.anchor).toBe("middle");
    expect(tick.style.fontFamily).toBe("monospace");
  });
});
