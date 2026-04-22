// ====================================================================================
// FILE: src/lit3/WebComponents/Shapes/Shape/Shape.ts
// ====================================================================================

import { LitElement } from "lit";
import { Rectangle2, Vector2 } from "@monorepo/core-math";

import type { IShape } from "./IShape.js";
import type { ICanvasContext } from "../../ICanvasContext.js";
import { PointInsidePrimitiveController } from "../../../Controllers/PointInsidePrimetiveController.js";

export type ShapeType = "circle" | "rectangle" | "edge";  

export abstract class Shape extends LitElement implements IShape {
  public abstract pointInsideShape(point: Vector2, type: ShapeType): boolean;
  
  protected pointInsidePrimitiveController: PointInsidePrimitiveController = new PointInsidePrimitiveController(this);
  protected _center: Vector2 = new Vector2(0, 0);
  protected _width = 0;
  protected _height = 0;

  public getId(): string {
    return this.id;
  }

  public getCenter(): Vector2 {
    return this._center;
  }

  public setCenter(center: Vector2): void {
    this._center = center;
  }

  public getPosition(): Vector2 {
    return new Vector2(
      this._center.x - this._width * 0.5,
      this._center.y - this._height * 0.5,
    );
  }

  public setPosistion(position: Vector2): void {
    this._center = new Vector2(
      position.x + this._width * 0.5,
      position.y + this._height * 0.5,
    );
  }

  public getWidth(): number {
    return this._width;
  }

  public setWidth(width: number): void {
    this._width = Math.max(0, width);
  }

  public getHeight(): number {
    return this._height;
  }

  public setHeight(height: number): void {
    this._height = Math.max(0, height);
  }

  public setSize(width: number, height: number): void {
    this._width = Math.max(0, width);
    this._height = Math.max(0, height);
  }

  public getBoundaries(): Rectangle2 {
    const position = this.getPosition();
    return {
      x: position.x,
      y: position.y,
      width: this.getWidth(),
      height: this.getHeight(),
    };
  }

  public abstract draw(context: ICanvasContext): void;
}