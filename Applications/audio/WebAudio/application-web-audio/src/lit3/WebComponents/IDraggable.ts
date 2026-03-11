import type { IShape } from "./IShape.js";

export type Point = Readonly<{
  x: number;
  y: number;
}>;

export interface IDraggable {
  readonly shape: IShape;
  getPosition(): Point;
  setPosition(position: Point): void;
  containsPoint(point: Point): boolean;
}