import { SvgLitElement, type SvgRootNode } from "@monorepo/core-svg-fabric";
import { type PropertyDeclarations } from "lit";
import type { ProductShapeStyleReference } from "../../domain/product-shape-contracts.js";
import {
  createProductShapeStyleReference,
  ProductShapeStyleToken,
  type ProductShapeStyleTokenName,
} from "../../style/product-shape-style-tokens.js";

export abstract class ProductShapeElement extends SvgLitElement<SvgRootNode> {
  public static override properties: PropertyDeclarations = {
    token: { type: String },
    fill: { type: String },
    stroke: { type: String },
    strokeWidth: { type: Number, attribute: "stroke-width" },
  };

  public declare token: ProductShapeStyleTokenName;
  public declare fill: string;
  public declare stroke: string;
  public declare strokeWidth: number | undefined;

  public constructor() {
    super();
    this.token = ProductShapeStyleToken.Base;
    this.fill = "";
    this.stroke = "";
    this.strokeWidth = undefined;
  }

  protected get styleInput(): ProductShapeStyleReference {
    return createProductShapeStyleReference({
      token: this.token,
      fill: this.hasAttribute("fill") ? this.fill : undefined,
      stroke: this.hasAttribute("stroke") ? this.stroke : undefined,
      strokeWidth: this.hasAttribute("stroke-width")
        ? this.strokeWidth
        : undefined,
    });
  }
}
