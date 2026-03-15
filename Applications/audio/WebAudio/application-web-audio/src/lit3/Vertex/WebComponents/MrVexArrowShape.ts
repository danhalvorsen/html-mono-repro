import { customElement, property } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../../WebComponents/ICanvasContext.js";
import type { ShapeType } from "../../WebComponents/Shapes/Shape/Shape.js";
import { VertexShape } from "../VertexShape.js";

@customElement("mr-vex-arrow-shape")
export class MrVexArrowShape extends VertexShape {
  @property({ type: String })
  public stroke = "#60a5fa";

  @property({ type: String })
  public fill = "#60a5fa";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 2;

  @property({ type: Number, attribute: "head-length" })
  public headLength = 16;

  @property({ type: Number, attribute: "head-width" })
  public headWidth = 10;

  public override pointInsideShape(point: Vector2, _type: ShapeType): boolean {
    return this.containsPoint(point);
  }

  public override draw(context: ICanvasContext): void {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return;
    }

    const start = vertices.start.getCenter();
    const end = vertices.end.getCenter();
    const arrowHead = this.getArrowHead(start, end);
    const { ctx } = context;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.strokeWidth;
    ctx.stroke();

    if (arrowHead !== null) {
      ctx.beginPath();
      ctx.moveTo(arrowHead.left.x, arrowHead.left.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineTo(arrowHead.right.x, arrowHead.right.y);

      if (this.fill !== "transparent") {
        ctx.closePath();
        ctx.fillStyle = this.fill;
        ctx.fill();
      }

      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = this.strokeWidth;
      ctx.stroke();
    }

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

    const start = vertices.start.getCenter();
    const end = vertices.end.getCenter();
    const tolerance = this.strokeWidth + 4;

    if (
      this.pointInsidePrimitiveController.pointNearLineSegment(
        point,
        start,
        end,
        tolerance,
      )
    ) {
      return true;
    }

    const arrowHead = this.getArrowHead(start, end);

    if (arrowHead === null) {
      return false;
    }

    return (
      this.pointInsidePrimitiveController.pointNearLineSegment(
        point,
        arrowHead.left,
        end,
        tolerance,
      ) ||
      this.pointInsidePrimitiveController.pointNearLineSegment(
        point,
        arrowHead.right,
        end,
        tolerance,
      )
    );
  }

  private getArrowHead(
    start: Vector2,
    end: Vector2,
  ): { left: Vector2; right: Vector2 } | null {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) {
      return null;
    }

    const unitX = dx / length;
    const unitY = dy / length;
    const normalX = -unitY;
    const normalY = unitX;
    const baseX = end.x - unitX * this.headLength;
    const baseY = end.y - unitY * this.headLength;
    const halfHeadWidth = this.headWidth * 0.5;

    return {
      left: new Vector2(
        baseX + normalX * halfHeadWidth,
        baseY + normalY * halfHeadWidth,
      ),
      right: new Vector2(
        baseX - normalX * halfHeadWidth,
        baseY - normalY * halfHeadWidth,
      ),
    };
  }
}

export { MrVexArrowShape as VertexArrowShape };

declare global {
  interface HTMLElementTagNameMap {
    "mr-vex-arrow-shape": MrVexArrowShape;
  }
}
