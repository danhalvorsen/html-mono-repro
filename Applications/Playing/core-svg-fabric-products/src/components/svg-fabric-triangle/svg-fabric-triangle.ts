import { type SvgRootNode } from "@monorepo/core-svg-fabric";
import { type PropertyDeclarations } from "lit";
import { createTriangleShapeRootNode } from "../../composition/product-shape-node-factory.js";
import { ProductShapeElementTag } from "../../domain/product-shape-contracts.js";
import {
  ProductShapeStyleToken,
  type ProductShapeStyleTokenName,
} from "../../style/product-shape-style-tokens.js";
import { ProductShapeElement } from "../product-shape-element/product-shape-element.js";

export class SvgFabricTriangleElement extends ProductShapeElement {
  public static override properties: PropertyDeclarations = {
    side: { type: Number },
  };

  public declare side: number;
  public declare token: ProductShapeStyleTokenName;

  public constructor() {
    super();
    this.side = 96;
    this.token = ProductShapeStyleToken.Triangle;
  }

  public override renderNode(): SvgRootNode {
    return createTriangleShapeRootNode({
      side: this.side,
      style: this.styleInput,
    });
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(ProductShapeElementTag.Triangle)
) {
  customElements.define(ProductShapeElementTag.Triangle, SvgFabricTriangleElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-fabric-triangle": SvgFabricTriangleElement;
  }
}
