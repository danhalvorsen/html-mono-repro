import { type SvgRootNode } from "@monorepo/core-svg-fabric";
import { type PropertyDeclarations } from "lit";
import { createBoxTriangleShapeRootNode } from "../../composition/product-shape-node-factory.js";
import { ProductShapeElementTag } from "../../domain/product-shape-contracts.js";
import {
  ProductShapeStyleToken,
  type ProductShapeStyleTokenName,
} from "../../style/product-shape-style-tokens.js";
import { ProductShapeElement } from "../product-shape-element/product-shape-element.js";

export class SvgFabricBoxTriangleElement extends ProductShapeElement {
  public static override properties: PropertyDeclarations = {
    boxWidth: { type: Number, attribute: "box-width" },
    boxHeight: { type: Number, attribute: "box-height" },
    triangleSide: { type: Number, attribute: "triangle-side" },
    gap: { type: Number },
  };

  public boxWidth = 96;
  public boxHeight = 72;
  public triangleSide = 72;
  public gap = 16;
  public override token: ProductShapeStyleTokenName =
    ProductShapeStyleToken.BoxTriangle;

  public override renderNode(): SvgRootNode {
    return createBoxTriangleShapeRootNode({
      box: {
        width: this.boxWidth,
        height: this.boxHeight,
      },
      triangle: {
        side: this.triangleSide,
      },
      layout: {
        gap: this.gap,
      },
      style: this.styleInput,
    });
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(ProductShapeElementTag.BoxTriangle)
) {
  customElements.define(
    ProductShapeElementTag.BoxTriangle,
    SvgFabricBoxTriangleElement,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-fabric-box-triangle": SvgFabricBoxTriangleElement;
  }
}
