import { Vector2 } from "@monorepo/core-math";
import { ILinePrimitiveRenderer } from "./ILinePrimitiveRenderer";
import { IStrokeStyle } from "../Style/IStrokeStyle";
 
// ============================================================================
// CTX PRIMITIVE RENDERERS
// ============================================================================

export class CtxLinePrimitiveRenderer implements ILinePrimitiveRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    start: Vector2,
    end: Vector2,
    style: IStrokeStyle
  ): void {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth;
    ctx.stroke();
  }
}
