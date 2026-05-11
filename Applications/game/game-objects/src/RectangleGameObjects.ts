import { Vector2 } from "@monorepo/core-math";
import { type CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
 
import { SvgPolygonTemplate } from "./SvgPolygonTemplate.js";
import { BaseGameObject } from "./BaseGameObject.js";

@customElement("rectangle-game-object")
export class RectangleGameObject extends BaseGameObject {
  public static styles: CSSResultGroup = BaseGameObject.styles;

  @property({ type: Number })
  public strokeWidth = 2;

  protected override willUpdate(): void {
    const halfSize = this.size / 2;

    this.shapeTemplate = new SvgPolygonTemplate({
      width: this.size,
      height: this.size,
      points: [
        new Vector2(-halfSize, -halfSize),
        new Vector2(halfSize, -halfSize),
        new Vector2(halfSize, halfSize),
        new Vector2(-halfSize, halfSize),
      ],
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rectangle-game-object": RectangleGameObject;
  }
}
