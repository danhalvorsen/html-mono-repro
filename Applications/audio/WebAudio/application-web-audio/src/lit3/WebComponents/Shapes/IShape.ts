
import type { BoundingBox2D, Vector2 } from "@monorepo/core-math";
import type { ICanvasContext } from "../ICanvasContext";

export interface IShape {

  draw(context: ICanvasContext): void;

  getBoundingBox(): BoundingBox2D;
  containsPoint(point: Vector2): boolean;

  setBoundingBox(bounds: BoundingBox2D): void;

}