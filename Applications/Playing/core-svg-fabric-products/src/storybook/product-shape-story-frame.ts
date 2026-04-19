import { html, type TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import {
  ProductShapeStyleToken,
  type ProductShapeStyleTokenName,
} from "../style/product-shape-style-tokens.js";

export const PRODUCT_SHAPE_STORY_TOKENS = Object.freeze(
  Object.values(ProductShapeStyleToken),
);

export interface ProductShapeStoryStyleArgs {
  readonly token: ProductShapeStyleTokenName;
  readonly fill: string;
  readonly stroke: string;
  readonly strokeWidth: number | undefined;
}

export const productShapeStoryStyleArgTypes = {
  token: {
    control: { type: "select" },
    options: [...PRODUCT_SHAPE_STORY_TOKENS],
  },
  fill: { control: { type: "color" } },
  stroke: { control: { type: "color" } },
  strokeWidth: { control: { type: "number", min: 0, max: 24, step: 0.1 } },
};

export const productShapeStoryStyleArgs: ProductShapeStoryStyleArgs = {
  token: ProductShapeStyleToken.Base,
  fill: "",
  stroke: "",
  strokeWidth: undefined,
};

export function renderProductShapeStoryFrame(content: TemplateResult): TemplateResult {
  return html`
    <div
      style="
        display: grid;
        place-items: center;
        min-width: 260px;
        min-height: 220px;
        padding: 24px;
        border: 1px solid #334155;
        border-radius: 14px;
        background: #0f172a;
        box-sizing: border-box;
      "
    >
      ${content}
    </div>
  `;
}

export function optionalStyleAttributes(args: ProductShapeStoryStyleArgs): {
  readonly fill: string | undefined;
  readonly stroke: string | undefined;
  readonly strokeWidth: string | undefined;
} {
  return {
    fill: args.fill.trim() === "" ? undefined : args.fill,
    stroke: args.stroke.trim() === "" ? undefined : args.stroke,
    strokeWidth:
      args.strokeWidth === undefined ? undefined : String(args.strokeWidth),
  };
}

export { ifDefined };
