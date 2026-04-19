import { type SvgRootNode } from "@monorepo/core-svg-fabric";
import { type PropertyDeclarations } from "lit";
import { createBoxShapeRootNode } from "../../composition/product-shape-node-factory.js";
import { ProductShapeElementTag } from "../../domain/product-shape-contracts.js";
import {
  ProductShapeStyleToken,
  type ProductShapeStyleTokenName,
} from "../../style/product-shape-style-tokens.js";
import { ProductShapeElement } from "../product-shape-element/product-shape-element.js";

export class SvgFabricBoxElement extends ProductShapeElement {
  public static override properties: PropertyDeclarations = {
    width: { type: Number },
    height: { type: Number },
  };

  public width = 96;
  public height = 72;
  public override token: ProductShapeStyleTokenName = ProductShapeStyleToken.Box;

  public override renderNode(): SvgRootNode {
    return createBoxShapeRootNode({
      width: this.width,
      height: this.height,
      style: this.styleInput,
    });
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(ProductShapeElementTag.Box)
) {
  customElements.define(ProductShapeElementTag.Box, SvgFabricBoxElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-fabric-box": SvgFabricBoxElement;
  }
}
