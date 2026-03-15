import { Vector2 } from "@monorepo/core-math";
import { IStrokeStyle } from "../Style/IStrokeStyle";
 
export interface ILinePrimitiveRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    start: Vector2,
    end: Vector2,
    style: IStrokeStyle
  ): void;
}
