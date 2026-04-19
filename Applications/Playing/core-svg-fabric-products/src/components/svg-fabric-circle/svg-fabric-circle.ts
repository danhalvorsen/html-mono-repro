import { type SvgRootNode } from "@monorepo/core-svg-fabric";
import { type PropertyDeclarations } from "lit";
import { createCircleShapeRootNode } from "../../composition/product-shape-node-factory.js";
import { ProductShapeElementTag } from "../../domain/product-shape-contracts.js";
import { ProductShapeElement } from "../product-shape-element/product-shape-element.js";
import {
  ProductShapeStyleToken,
  type ProductShapeStyleTokenName,
} from "../../style/product-shape-style-tokens.js";

export class SvgFabricCircleElement extends ProductShapeElement {
  public static override properties: PropertyDeclarations = {
    radius: { type: Number },
  };

  public radius = 48;
  public override token: ProductShapeStyleTokenName =
    ProductShapeStyleToken.Circle;

  public override renderNode(): SvgRootNode {
    return createCircleShapeRootNode({
      radius: this.radius,
      style: this.styleInput,
    });
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(ProductShapeElementTag.Circle)
) {
  customElements.define(ProductShapeElementTag.Circle, SvgFabricCircleElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-fabric-circle": SvgFabricCircleElement;
  }
}
