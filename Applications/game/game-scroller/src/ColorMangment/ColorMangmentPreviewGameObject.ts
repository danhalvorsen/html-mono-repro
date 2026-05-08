import { customElement } from "lit/decorators.js";
import { BaseGameObject } from "../GameObjects/BaseGameObject.js";
import { ColorMangmentPreviewShapeTemplate } from "./ColorMangmentPreviewShapeTemplate.js";
import type { ColorMangmentScheme } from "./ColorMangmentTypes.js";

@customElement("color-mangment-preview-game-object")
export class ColorMangmentPreviewGameObject extends BaseGameObject {
  public colorMangmentScheme: ColorMangmentScheme | undefined;

  public constructor() {
    super();

    this.options = {
      ...this.options,
      width: 180,
      height: 120,
    };

    this.shapeTemplate = new ColorMangmentPreviewShapeTemplate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "color-mangment-preview-game-object": ColorMangmentPreviewGameObject;
  }
}