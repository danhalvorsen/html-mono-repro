import { Shape } from "./Shapes/Shape/Shape.js";

export type Point = Readonly<{
  x: number;
  y: number;
}>;

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
