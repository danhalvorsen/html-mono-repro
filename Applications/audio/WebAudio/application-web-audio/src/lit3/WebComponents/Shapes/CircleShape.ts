// ====================================================================================
// FILE: src/lit3/WebComponents/Shapes/CircleShape.ts
// ====================================================================================

import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../ICanvasContext.js";
import { Shape, ShapeType } from "./Shape/Shape.js";
import { Vector2CenterConverter } from "./Vector2CenterConverter.js";

const vector2CenterConverter = new Vector2CenterConverter(new Vector2(30, 20));

@customElement("mr-circle-shape")
export class CircleShape extends Shape {
  public pointInsideShape(point: Vector2, type: ShapeType): boolean {
     return this.pointInsidePrimitiveController
       .pointInsideCircle(point, this.getPosition(), this.getWidth() * 0.5 );
  }

  @property({ attribute: "center", converter: vector2CenterConverter })
  public center: Vector2 = new Vector2(30, 20);

  @property({ type: Number })
  public radius = 6;

  @property({ type: String })
  public fill = "#ffffff";

  @property({ type: String })
  public stroke = "#1f2937";

  @property({ type: Number })
  public strokeWidth = 1;

  public override getCenter(): Vector2 {
    return this.center;
  }

  public override setCenter(center: Vector2): void {
    this.center = center;
    this.requestUpdate();
  }

  public override getPosition(): Vector2 {
    return new Vector2(
      this.center.x - this.radius,
      this.center.y - this.radius,
    );
  }

  public override setPosistion(position: Vector2): void {
    this.center = new Vector2(
      position.x + this.radius,
      position.y + this.radius,
    );

    this.requestUpdate();
  }

  public override getWidth(): number {
    return this.radius * 2;
  }

  public override setWidth(width: number): void {
    this.radius = Math.max(0, width * 0.5);
    this.requestUpdate();
  }

  public override getHeight(): number {
    return this.radius * 2;
  }

  public override setHeight(height: number): void {
    this.radius = Math.max(0, height * 0.5);
    this.requestUpdate();
  }

  public override setSize(width: number, height: number): void {
    this.radius = Math.max(0, Math.min(width, height) * 0.5);
    this.requestUpdate();
  }

  public draw(context: ICanvasContext): void {
    const { ctx } = context;

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.fill;
    ctx.fill();
    ctx.lineWidth = this.strokeWidth;
    ctx.strokeStyle = this.stroke;
    ctx.stroke();
    ctx.restore();
  }

  protected override render() {
    return html``;
  }
}