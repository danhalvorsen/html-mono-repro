import { customElement, property } from "lit/decorators.js";

import { Vector2 } from "@monorepo/core-math";
import type { ICanvasContext } from "../../WebComponents/ICanvasContext.js";
import type { ShapeType } from "../../WebComponents/Shapes/Shape/Shape.js";
import { VertexShape } from "../VertexShape.js";
 
@customElement("mr-vex-line-shape")
export class MrVexLineShape extends VertexShape {
  @property({ type: String })
  public stroke = "#60a5fa";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 2;

  public override pointInsideShape(point: Vector2, _type: ShapeType): boolean {
    return this.containsPoint(point);
  }

  public draw(context: ICanvasContext): void {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return;
    }

    const a = vertices.start.getCenter();
    const b = vertices.end.getCenter();

    const { ctx } = context;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);

    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.strokeWidth;

    ctx.stroke();
    ctx.restore();

    this.drawVertices(context);
  }

  public containsPoint(point: Vector2): boolean {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return false;
    }

    if (this.containsVertexPoint(point)) {
      return true;
    }

    return this.pointInsidePrimitiveController.pointNearLineSegment(
      point,
      vertices.start.getCenter(),
      vertices.end.getCenter(),
      this.strokeWidth + 4,
    );
  }
}
