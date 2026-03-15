import { Shape } from "./Shapes/Shape/Shape.js";

export type Point = Readonly<{
  x: number;
  y: number;
}>;

export interface IDraggable {
  readonly shape: Shape;
  getPosition(): Point;
  setPosition(position: Point): void;
  containsPoint(point: Point): boolean;
}