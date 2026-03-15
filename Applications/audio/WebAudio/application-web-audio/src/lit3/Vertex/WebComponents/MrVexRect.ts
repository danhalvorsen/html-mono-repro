import { customElement, property } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../../WebComponents/ICanvasContext.js";
import type { ShapeType } from "../../WebComponents/Shapes/Shape/Shape.js";
import { VertexShape } from "../VertexShape.js";

@customElement("mr-vex-rect")
export class MrVexRect extends VertexShape {
  @property({ type: String })
  public fill = "transparent";

  @property({ type: String })
  public stroke = "#60a5fa";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 2;

  public override pointInsideShape(point: Vector2, _type: ShapeType): boolean {
    return this.containsPoint(point);
  }

  public containsPoint(point: Vector2): boolean {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return false;
    }

    if (this.containsVertexPoint(point)) {
      return true;
    }

    return this.pointInsidePrimitiveController.pointInsideRect(
      point,
      this.getPosition(),
      this.getWidth(),
      this.getHeight(),
    );
  }

  public override draw(context: ICanvasContext): void {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return;
    }

    const { ctx } = context;
    const position = this.getPosition();
    const width = this.getWidth();
    const height = this.getHeight();

    ctx.save();
    ctx.beginPath();
    ctx.rect(position.x, position.y, width, height);

    if (this.fill !== "transparent") {
      ctx.fillStyle = this.fill;
      ctx.fill();
    }

    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.strokeWidth;
    ctx.stroke();
    ctx.restore();

    this.drawVertices(context);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-vex-rect": MrVexRect;
  }
}
