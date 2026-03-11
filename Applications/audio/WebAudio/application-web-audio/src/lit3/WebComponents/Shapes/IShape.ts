import type { BoundingBox2D } from "@monorepo/core-math";
import type { ICanvasContext } from "../ICanvasContext";

export interface IShape {

  draw(context: ICanvasContext): void;

  getBoundingBox(): BoundingBox2D;

  setBoundingBox(bounds: BoundingBox2D): void;

}