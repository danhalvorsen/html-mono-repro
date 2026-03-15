import { customElement, property } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../../WebComponents/ICanvasContext.js";
import type { ShapeType } from "../../WebComponents/Shapes/Shape/Shape.js";
import { VertexCollectionShape } from "../VertexCollectionShape.js";

@customElement("mr-vex-polygon-shape")
export class MrVexPolygonShape extends VertexCollectionShape {
  @property({ type: String })
  public stroke = "#60a5fa";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 2;

  @property({ type: String })
  public fill = "transparent";

  public override pointInsideShape(point: Vector2, _type: ShapeType): boolean {
    return this.containsPoint(point);
  }

  public override draw(context: ICanvasContext): void {
    const vertices = this.getVertices();
    const [firstVertex, ...rest] = vertices;

    if (firstVertex === undefined) {
      return;
    }

    if (vertices.length > 1) {
      const { ctx } = context;
      const first = firstVertex.getCenter();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);

      for (const vertex of rest) {
        const center = vertex.getCenter();
        ctx.lineTo(center.x, center.y);
      }

      ctx.closePath();

      if (this.fill !== "transparent") {
        ctx.fillStyle = this.fill;
        ctx.fill();
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

    for (let index = 0; index < vertices.length; index++) {
      const start = points[index]!;
      const end = points[(index + 1) % points.length]!;

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

    if (points.length < 3) {
      return false;
    }

    return this.pointInsidePrimitiveController.pointInsidePolygon(point, points);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-vex-polygon-shape": MrVexPolygonShape;
  }
}
