import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BoundingBox2D } from "@monorepo/core-math";

import type { ICanvasContext } from "../ICanvasContext.js";

import { CircleShape } from "./CircleShape.js";

@customElement("mr-edge-shape")
export class EdgeShape extends LitElement {

  @property({ type: Number }) public x = 0;
  @property({ type: Number }) public y = 0;

  @property({ type: Number }) public startX = 0;
  @property({ type: Number }) public startY = 0;
  @property({ type: Number }) public endX = 100;
  @property({ type: Number }) public endY = 0;

  @property({ type: String }) public stroke = "#60a5fa";
  @property({ type: Number }) public strokeWidth = 1.5;

  public readonly startCircle = new CircleShape();
  public readonly endCircle = new CircleShape();

  public constructor() {
    super();
    this.syncHandles();
  }

  public get start() {
    return { x: this.startX, y: this.startY };
  }

  public get end() {
    return { x: this.endX, y: this.endY };
  }

  public length(): number {
    return Math.hypot(this.endX - this.startX, this.endY - this.startY);
  }

  public draw(context: ICanvasContext): void {

    const { ctx } = context;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.endX, this.endY);
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.strokeWidth;
    ctx.stroke();
    ctx.restore();

    this.startCircle.draw(context);
    this.endCircle.draw(context);
  }

  public containsPoint(x: number, y: number): boolean {

    if (this.startCircle.containsPoint(x, y) || this.endCircle.containsPoint(x, y))
      return true;

    const segmentX = this.endX - this.startX;
    const segmentY = this.endY - this.startY;
    const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;

    if (segmentLengthSquared === 0) {
      return this.startCircle.containsPoint(x, y);
    }

    const toPointX = x - this.startX;
    const toPointY = y - this.startY;
    const t = Math.max(0, Math.min(1, (toPointX * segmentX + toPointY * segmentY) / segmentLengthSquared));

    const closestX = this.startX + t * segmentX;
    const closestY = this.startY + t * segmentY;
    const distance = Math.hypot(x - closestX, y - closestY);

    const tolerance = Math.max(6, this.strokeWidth + 4);

    return distance <= tolerance;
  }

  public getBoundingBox(): BoundingBox2D {
    const minX = Math.min(this.startX, this.endX);
    const minY = Math.min(this.startY, this.endY);
    const maxX = Math.max(this.startX, this.endX);
    const maxY = Math.max(this.startY, this.endY);

    return new BoundingBox2D(
      { x: minX, y: minY } as any,
      { x: maxX, y: maxY } as any,
    );
  }

  public setBoundingBox(bounds: BoundingBox2D): void {

    this.startX = bounds.min.x;
    this.startY = bounds.min.y;

    this.endX = bounds.max.x;
    this.endY = bounds.max.y;

    this.x = bounds.min.x;
    this.y = bounds.min.y;

    this.syncHandles();
  }

  protected override render() {
    return html``;
  }

  private syncHandles(): void {

    this.startCircle.x = this.startX;
    this.startCircle.y = this.startY;

    this.endCircle.x = this.endX;
    this.endCircle.y = this.endY;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-edge-shape": EdgeShape;
  }
}