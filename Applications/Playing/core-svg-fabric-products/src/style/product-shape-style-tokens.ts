import {
  createSvgStyleResolver,
  resolveSvgStrokeFillStyle,
  type SvgStrokeFillStyle,
} from "@monorepo/core-svg-fabric";
import type { IStyle, IStyleToken } from "@monorepo/core-style-system";
import type { ProductShapeStyleReference } from "../domain/product-shape-contracts.js";

export const ProductShapeStyleToken = Object.freeze({
  Base: "product-shape-base",
  Circle: "product-shape-circle",
  Box: "product-shape-box",
  Triangle: "product-shape-triangle",
  BoxTriangle: "product-shape-box-triangle",
} as const);

export type ProductShapeStyleTokenName =
  (typeof ProductShapeStyleToken)[keyof typeof ProductShapeStyleToken];

export const PRODUCT_SHAPE_STYLE_TOKENS = {
  [ProductShapeStyleToken.Base]: {
    name: ProductShapeStyleToken.Base,
    extends: ["circle-primary"],
    style: {
      fill: { color: "#1d9bf0" },
      stroke: { color: "#0b5a8f", width: 2 },
      opacity: 1,
    },
  },
  [ProductShapeStyleToken.Circle]: {
    name: ProductShapeStyleToken.Circle,
    extends: [ProductShapeStyleToken.Base],
    style: {},
  },
  [ProductShapeStyleToken.Box]: {
    name: ProductShapeStyleToken.Box,
    extends: [ProductShapeStyleToken.Base],
    style: {},
  },
  [ProductShapeStyleToken.Triangle]: {
    name: ProductShapeStyleToken.Triangle,
    extends: [ProductShapeStyleToken.Base],
    style: {},
  },
  [ProductShapeStyleToken.BoxTriangle]: {
    name: ProductShapeStyleToken.BoxTriangle,
    extends: [ProductShapeStyleToken.Base],
    style: {},
  },
} as const satisfies Record<ProductShapeStyleTokenName, IStyleToken>;

export const productShapeStyleResolver = createSvgStyleResolver(
  PRODUCT_SHAPE_STYLE_TOKENS,
);

export const DEFAULT_PRODUCT_SHAPE_STYLE_REFERENCE: ProductShapeStyleReference =
  Object.freeze({
    token: ProductShapeStyleToken.Base,
  });

export interface ProductShapeStyleOverrideInput {
  readonly token: ProductShapeStyleTokenName;
  readonly fill?: string | undefined;
  readonly stroke?: string | undefined;
  readonly strokeWidth?: number | undefined;
}

export function createProductShapeStyleReference(
  input: ProductShapeStyleOverrideInput,
): ProductShapeStyleReference {
  const overrides = createProductShapeStyleOverrides(input);

  return {
    token: input.token,
    ...(overrides !== undefined ? { overrides } : {}),
  };
}

export function resolveProductShapeStyle(
  reference: Readonly<ProductShapeStyleReference>,
): SvgStrokeFillStyle {
  return resolveSvgStrokeFillStyle(productShapeStyleResolver, reference);
}

function createProductShapeStyleOverrides(
  input: ProductShapeStyleOverrideInput,
): IStyle | undefined {
  if (
    input.fill === undefined &&
    input.stroke === undefined &&
    input.strokeWidth === undefined
  ) {
    return undefined;
  }

  return {
    ...(input.fill !== undefined ? { fill: { color: input.fill } } : {}),
    ...(input.stroke !== undefined || input.strokeWidth !== undefined
      ? {
          stroke: {
            ...(input.stroke !== undefined ? { color: input.stroke } : {}),
            ...(input.strokeWidth !== undefined
              ? { width: input.strokeWidth }
              : {}),
          },
        }
      : {}),
  };
}
