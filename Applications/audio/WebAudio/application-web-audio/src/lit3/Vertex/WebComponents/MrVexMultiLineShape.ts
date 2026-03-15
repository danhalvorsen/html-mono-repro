import { customElement, property } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../../WebComponents/ICanvasContext.js";
import type { ShapeType } from "../../WebComponents/Shapes/Shape/Shape.js";
import { VertexCollectionShape } from "../VertexCollectionShape.js";

@customElement("mr-vex-multi-line-shape")
export class MrVexMultiLineShape extends VertexCollectionShape {
  @property({ type: String })
  public stroke = "#60a5fa";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 2;

  public override pointInsideShape(point: Vector2, _type: ShapeType): boolean {
    return this.containsPoint(point);
  }

  public override draw(context: ICanvasContext): void {
    const points = this.getVertexCenters();
    const [first, ...rest] = points;

    if (first !== undefined && rest.length > 0) {
      const { ctx } = context;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);

      for (const point of rest) {
        ctx.lineTo(point.x, point.y);
      }

      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = this.strokeWidth;
      ctx.stroke();
      ctx.restore();
    }

    this.drawVertices(context);
  }

  public containsPoint(point: Vector2): boolean {
    const vertices = this.getVertices();

    if (vertices.length === 0) {
      return false;
    }

    if (this.containsVertexPoint(point)) {
      return true;
    }

    const points = this.getVertexCenters(vertices);

    for (let index = 0; index < points.length - 1; index++) {
      const start = points[index]!;
      const end = points[index + 1]!;

      if (
        this.pointInsidePrimitiveController.pointNearLineSegment(
          point,
          start,
          end,
          this.strokeWidth + 4,
        )
      ) {
        return true;
      }
    }

    return false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-vex-multi-line-shape": MrVexMultiLineShape;
  }
}
