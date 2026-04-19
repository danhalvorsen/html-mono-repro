import { describe, expect, it } from "vitest";
import { IDENTITY_MATRIX_3X3 } from "../src/domain/matrix3x3.js";
import { SvgNodeKind } from "../src/domain/svg-node.js";
import { SvgShapeTemplateFactory } from "../src/factories/svg-shape-template-factory.js";

describe("SvgShapeTemplateFactory", () => {
  it("builds immutable serializable rectangle nodes", () => {
    const factory = new SvgShapeTemplateFactory();
    const node = factory
      .rect()
      .x(1)
      .y(2)
      .width(10)
      .height(20)
      .fill("#fff")
      .strokeWidth(2)
      .strokeDasharray("2 4")
      .opacity(0.75)
      .buildNode();

    expect(node).toMatchObject({
      kind: SvgNodeKind.Rect,
      x: 1,
      y: 2,
      width: 10,
      height: 20,
      style: {
        fill: "#fff",
        strokeWidth: 2,
        strokeDasharray: "2 4",
        opacity: 0.75,
      },
      transform: IDENTITY_MATRIX_3X3,
      children: [],
    });
    expect(Object.isFrozen(node)).toBe(true);
    expect(Object.isFrozen(node.style)).toBe(true);
    expect(Object.isFrozen(node.children)).toBe(true);
  });

  it("rejects invalid primitive geometry", () => {
    const factory = new SvgShapeTemplateFactory();

    expect(() => factory.rect().width(-1)).toThrow(/width must be >= 0/i);
    expect(() => factory.circle().radius(-1)).toThrow(/radius must be >= 0/i);
    expect(() => factory.polygon().points(" ")).toThrow(/points must not be empty/i);
  });

  it("builds immutable root nodes", () => {
    const factory = new SvgShapeTemplateFactory();
    const child = factory.circle().radius(4).buildNode();
    const root = factory.svgNode({ width: 10, height: 10 }, child);

    expect(root.kind).toBe(SvgNodeKind.Svg);
    expect(root.children).toHaveLength(1);
    expect(Object.isFrozen(root)).toBe(true);
    expect(Object.isFrozen(root.viewport)).toBe(true);
    expect(Object.isFrozen(root.children)).toBe(true);
  });
});
