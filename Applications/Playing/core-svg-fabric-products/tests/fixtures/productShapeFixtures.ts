import {
  type BoxTriangleShapeInput,
  type BoxShapeInput,
  type CircleShapeInput,
  type TriangleShapeInput,
} from "../../src/domain/product-shape-contracts.js";
import { DEFAULT_PRODUCT_SHAPE_STYLE_REFERENCE } from "../../src/style/product-shape-style-tokens.js";

export const circleShapeFixture: CircleShapeInput = Object.freeze({
  radius: 24,
  style: DEFAULT_PRODUCT_SHAPE_STYLE_REFERENCE,
});

export const boxShapeFixture: BoxShapeInput = Object.freeze({
  width: 80,
  height: 40,
  style: DEFAULT_PRODUCT_SHAPE_STYLE_REFERENCE,
});

export const triangleShapeFixture: TriangleShapeInput = Object.freeze({
  side: 60,
  style: DEFAULT_PRODUCT_SHAPE_STYLE_REFERENCE,
});

export const boxTriangleShapeFixture: BoxTriangleShapeInput = Object.freeze({
  box: Object.freeze({
    width: 80,
    height: 40,
  }),
  triangle: Object.freeze({
    side: 60,
  }),
  layout: Object.freeze({
    gap: 12,
  }),
  style: DEFAULT_PRODUCT_SHAPE_STYLE_REFERENCE,
});
