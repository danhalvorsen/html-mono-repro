import { Vector2 } from "@monorepo/core-math";
import { ICirclePrimitiveRenderer } from "./ICirclePrimitiveRenderer";
import { IFillStrokeStyle } from "../Style/IFillStrokeStyle";


export class CtxCirclePrimitiveRenderer implements ICirclePrimitiveRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    center: Vector2,
    radius: number,
    style: IFillStrokeStyle
  ): void {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = style.fill;
    ctx.fill();
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth;
    ctx.stroke();
  }
}
