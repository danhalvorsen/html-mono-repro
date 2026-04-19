import { describe, expect, it } from "vitest";
import { createBoxShapeRootNode } from "../src/composition/product-shape-node-factory.js";
import {
  DEFAULT_PRODUCT_SHAPE_STYLE_REFERENCE,
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

  it("returns token-only reference when no overrides are provided", () => {
    expect(
      createProductShapeStyleReference({
        token: ProductShapeStyleToken.Triangle,
      }),
    ).toEqual({
      token: ProductShapeStyleToken.Triangle,
    });
  });

  it("creates fill-only overrides", () => {
    expect(
      createProductShapeStyleReference({
        token: ProductShapeStyleToken.Circle,
        fill: "#ff00ff",
      }),
    ).toEqual({
      token: ProductShapeStyleToken.Circle,
      overrides: {
        fill: { color: "#ff00ff" },
      },
    });
  });

  it("creates stroke-color-only overrides", () => {
    expect(
      createProductShapeStyleReference({
        token: ProductShapeStyleToken.Circle,
        stroke: "#123456",
      }),
    ).toEqual({
      token: ProductShapeStyleToken.Circle,
      overrides: {
        stroke: { color: "#123456" },
      },
    });
  });

  it("creates stroke-width-only overrides", () => {
    expect(
      createProductShapeStyleReference({
        token: ProductShapeStyleToken.Circle,
        strokeWidth: 7,
      }),
    ).toEqual({
      token: ProductShapeStyleToken.Circle,
      overrides: {
        stroke: { width: 7 },
      },
    });
  });

  it("creates stroke overrides with color and width", () => {
    expect(
      createProductShapeStyleReference({
        token: ProductShapeStyleToken.Circle,
        stroke: "#fedcba",
        strokeWidth: 3,
      }),
    ).toEqual({
      token: ProductShapeStyleToken.Circle,
      overrides: {
        stroke: { color: "#fedcba", width: 3 },
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

  it("resolves each shape token through the shared base token", () => {
    const expected = {
      fill: "#1d9bf0",
      stroke: "#0b5a8f",
      strokeWidth: 2,
      opacity: 1,
    };

    expect(resolveProductShapeStyle({ token: ProductShapeStyleToken.Circle })).toEqual(
      expected,
    );
    expect(resolveProductShapeStyle({ token: ProductShapeStyleToken.Box })).toEqual(
      expected,
    );
    expect(
      resolveProductShapeStyle({ token: ProductShapeStyleToken.Triangle }),
    ).toEqual(expected);
    expect(
      resolveProductShapeStyle({ token: ProductShapeStyleToken.BoxTriangle }),
    ).toEqual(expected);
  });

  it("exports the frozen default style reference", () => {
    expect(DEFAULT_PRODUCT_SHAPE_STYLE_REFERENCE).toEqual({
      token: ProductShapeStyleToken.Base,
    });
    expect(Object.isFrozen(DEFAULT_PRODUCT_SHAPE_STYLE_REFERENCE)).toBe(true);
  });

  it("throws for unknown tokens", () => {
    expect(() =>
      resolveProductShapeStyle({
        token: "missing-token" as unknown as ProductShapeStyleToken,
      }),
    ).toThrow("Unknown style token 'missing-token'.");
  });
});
