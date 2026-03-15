import { Vector2 } from "@monorepo/core-math";
import { IFillStrokeStyle } from "../Style/IFillStrokeStyle";
 
export interface ICirclePrimitiveRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    center: Vector2,
    radius: number,
    style: IFillStrokeStyle
  ): void;
}
