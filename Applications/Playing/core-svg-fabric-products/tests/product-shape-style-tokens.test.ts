import { describe, expect, it } from "vitest";
import { createBoxShapeRootNode } from "../src/composition/product-shape-node-factory.js";
import {
  PRODUCT_SHAPE_STYLE_TOKENS,
  ProductShapeStyleToken,
  createProductShapeStyleReference,
  resolveProductShapeStyle,
} from "../src/style/product-shape-style-tokens.js";
import {
  boxStyleOverrideInputFixture,
  boxStyleReferenceFixture,
  defaultProductShapeStyleFixture,
} from "./fixtures/productShapeStyleFixtures.js";

describe("product shape style tokens", () => {
  it("defines reusable tokens for every product shape component", () => {
    expect(Object.keys(PRODUCT_SHAPE_STYLE_TOKENS)).toEqual([
      ProductShapeStyleToken.Base,
      ProductShapeStyleToken.Circle,
      ProductShapeStyleToken.Box,
      ProductShapeStyleToken.Triangle,
      ProductShapeStyleToken.BoxTriangle,
    ]);
  });

  it("resolves the default shared product shape token", () => {
    expect(resolveProductShapeStyle(defaultProductShapeStyleFixture)).toEqual({
      fill: "#1d9bf0",
      stroke: "#0b5a8f",
      strokeWidth: 2,
      opacity: 1,
    });
  });

  it("creates style references from token and optional component overrides", () => {
    expect(createProductShapeStyleReference(boxStyleOverrideInputFixture)).toEqual({
      token: ProductShapeStyleToken.Box,
      overrides: {
        fill: { color: "#ffffff" },
        stroke: { width: 4 },
      },
    });
  });

  it("resolves overrides over the inherited product token", () => {
    expect(resolveProductShapeStyle(boxStyleReferenceFixture)).toEqual({
      fill: "#ffffff",
      stroke: "#0b5a8f",
      strokeWidth: 4,
      opacity: 1,
    });
  });

  it("uses token references when composing SVG nodes", () => {
    const node = createBoxShapeRootNode({
      width: 80,
      height: 40,
      style: boxStyleReferenceFixture,
    });
    const boxGroup = node.children[0];
    const rect = boxGroup?.children[0];

    expect(node.viewport).toEqual({
      width: 88,
      height: 48,
      role: "img",
      ariaHidden: true,
    });
    expect(rect?.style).toMatchObject({
      fill: "#ffffff",
      stroke: "#0b5a8f",
      strokeWidth: 4,
      opacity: 1,
    });
  });
});
