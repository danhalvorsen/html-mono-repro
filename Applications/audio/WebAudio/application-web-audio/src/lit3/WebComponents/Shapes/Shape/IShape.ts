// ====================================================================================
// FILE: src/lit3/WebComponents/Shapes/Shape/IShape.ts
// ====================================================================================

import { Vector2, Rectangle } from "@monorepo/core-math";
import { ICanvasContext } from "../../ICanvasContext";
import { ShapeType } from "./Shape";

export interface IShape {
  getId(): string;

  getCenter(): Vector2;
  setCenter(center: Vector2): void;

  getPosition(): Vector2;
  setPosistion(position: Vector2): void;  
  getWidth(): number;
  setWidth(width: number): void;

  getBoundaries(): Rectangle;

  getHeight(): number;
  setHeight(height: number): void;
  
  setSize(width: number, height: number): void;
  pointInsideShape(point: Vector2, type: ShapeType ): boolean;  
  draw(context: ICanvasContext): void;
}
