import type { IStyle } from "@monorepo/core-style-system";
import type { ProductShapeStyleReference } from "../../src/domain/product-shape-contracts.js";
import {
  DEFAULT_PRODUCT_SHAPE_STYLE_REFERENCE,
  ProductShapeStyleToken,
  type ProductShapeStyleOverrideInput,
} from "../../src/style/product-shape-style-tokens.js";

export const defaultProductShapeStyleFixture: ProductShapeStyleReference =
  DEFAULT_PRODUCT_SHAPE_STYLE_REFERENCE;

export const whiteFillStyleOverridesFixture: IStyle = Object.freeze({
  fill: Object.freeze({ color: "#ffffff" }),
  stroke: Object.freeze({ width: 4 }),
});

export const boxStyleReferenceFixture: ProductShapeStyleReference = Object.freeze({
  token: ProductShapeStyleToken.Box,
  overrides: whiteFillStyleOverridesFixture,
});

export const boxStyleOverrideInputFixture: ProductShapeStyleOverrideInput =
  Object.freeze({
    token: ProductShapeStyleToken.Box,
    fill: "#ffffff",
    strokeWidth: 4,
  });
