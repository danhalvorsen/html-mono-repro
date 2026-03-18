import { Point } from "@monorepo/core-math";
import { Shape } from "./Shapes/Shape/Shape.js";

export interface IHitTestable {
  containsPoint(point: Point): boolean;
}

export interface IPositionable {
  getPosition(): Point;
  setPosition(position: Point): void;
}

export interface IDraggable extends IHitTestable, IPositionable {
  readonly shape: Shape;
  
}
