// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Shapes/CircleShape.ts

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BoundingBox2D, Vector2 } from '@monorepo/core-math';

import type { ICanvasContext } from "../ICanvasContext.js";
import { IShape } from "./IShape.js";

@customElement("mr-circle-shape")
export class CircleShape extends LitElement implements IShape {
 @property({ attribute: false }) public center: Vector2 = new Vector2(30, 20);
  @property({ type: Number }) public radius = 6;

  @property({ type: String }) public fill = "#ffffff";
  @property({ type: String }) public stroke = "#1f2937";
  @property({ type: Number }) public strokeWidth = 1;

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

  public containsPoint(point: Vector2): boolean {
    const dx = this.center.x - point.x;
    const dy = this.center.y - point.y;
    return Math.hypot(dx, dy) <= this.radius;
  }

  public getBoundingBox(): BoundingBox2D {
    return new BoundingBox2D(
      { x: this.center.x - this.radius, y: this.center.y - this.radius } as any,
      { x: this.center.x + this.radius, y: this.center.y + this.radius } as any,
    );
  }

  public setBoundingBox(bounds: BoundingBox2D): void {
    const size = Math.min(bounds.width(), bounds.height());
    const nextRadius = Math.max(0, size / 2);
    const center = bounds.center();

    this.center = center;
    this.radius = nextRadius;
  }

  protected override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-circle-shape": CircleShape;
  }
}