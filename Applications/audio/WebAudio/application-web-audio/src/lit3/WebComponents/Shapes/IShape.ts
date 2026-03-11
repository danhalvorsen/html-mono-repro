import type { ICanvasContext } from "../ICanvasContext.js";

export interface IShape {
  x: number;
  y: number;

  draw(context: ICanvasContext): void;
  containsPoint(x: number, y: number): boolean;
}