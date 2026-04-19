import { createTranslationMatrix, SvgNodeKind } from "@monorepo/core-svg-fabric";
import { describe, expect, it } from "vitest";
import { createBoxTriangleShapeRootNode } from "../src/composition/product-shape-node-factory.js";
import { boxTriangleShapeFixture } from "./fixtures/productShapeFixtures.js";

describe("box-triangle composition", () => {
  it("composes the existing box and triangle nodes into one SVG root", () => {
    const node = createBoxTriangleShapeRootNode(boxTriangleShapeFixture);
    const compositionGroup = node.children[0];
    const boxGroup = compositionGroup?.children[0];
    const triangleGroup = compositionGroup?.children[1];

    expect(node.kind).toBe(SvgNodeKind.Svg);
    expect(node.viewport).toEqual({
      width: 160,
      height: 64,
      role: "img",
      ariaHidden: true,
    });
    expect(compositionGroup?.kind).toBe(SvgNodeKind.Group);
    expect(boxGroup?.kind).toBe(SvgNodeKind.Group);
    expect(triangleGroup?.kind).toBe(SvgNodeKind.Group);
    expect(boxGroup?.children[0]?.kind).toBe(SvgNodeKind.Rect);
    expect(triangleGroup?.children[0]?.kind).toBe(SvgNodeKind.Polygon);
    expect(boxGroup?.transform).toEqual(createTranslationMatrix(0, 10));
    expect(triangleGroup?.transform).toEqual(createTranslationMatrix(96, 0));
  });
});
