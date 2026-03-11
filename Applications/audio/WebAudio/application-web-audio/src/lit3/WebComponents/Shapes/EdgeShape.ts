import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BoundingBox2D, Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../ICanvasContext.js";
import { CircleShape } from "./CircleShape.js";
import type { IShape } from "./IShape.js";

@customElement("mr-edge-shape")
export class EdgeShape extends LitElement implements IShape {
  @property({ type: Number, attribute: "start-x" }) public startX = 30;
  @property({ type: Number, attribute: "start-y" }) public startY = 20;
  @property({ type: Number, attribute: "end-x" }) public endX = 200;
  @property({ type: Number, attribute: "end-y" }) public endY = 300;

  /** Alias for startX — satisfies the IPositionableShape contract used by MrDraggable. */
  public get x(): number { return this.startX; }
  public set x(value: number) {
    const dx = value - this.startX;
    if (this._hitZone === 'end') {
      this.endX += dx;
    } else if (this._hitZone === 'start') {
      this.startX = value;
    } else {
      this.startX = value;
      this.endX += dx;
    }
  }

  /** Alias for startY — satisfies the IPositionableShape contract used by MrDraggable. */
  public get y(): number { return this.startY; }
  public set y(value: number) {
    const dy = value - this.startY;
    if (this._hitZone === 'end') {
      this.endY += dy;
    } else if (this._hitZone === 'start') {
      this.startY = value;
    } else {
      this.startY = value;
      this.endY += dy;
    }
  }

  @property({ type: String }) public stroke = "#60a5fa";
  @property({ type: Number, attribute: "stroke-width" }) public strokeWidth = 1.5;
  @property({ type: Number, attribute: "handle-radius" }) public handleRadius = 6;
  @property({ type: String, attribute: "handle-fill" }) public handleFill = "#ffffff";
  @property({ type: String, attribute: "handle-stroke" }) public handleStroke = "#1f2937";
  @property({ type: Number, attribute: "handle-stroke-width" }) public handleStrokeWidth = 1;

  public readonly startCircle = new CircleShape();
  public readonly endCircle = new CircleShape();

  private _hitZone: 'start' | 'end' | 'line' = 'line';

  public constructor() {
    super();
    this.syncHandles();
  }

  public draw(context: ICanvasContext): void {
    this.syncHandles();

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
    if (this.startCircle.containsPoint(x, y)) {
      this._hitZone = 'start';
      return true;
    }

    if (this.endCircle.containsPoint(x, y)) {
      this._hitZone = 'end';
      return true;
    }

    const dx = this.endX - this.startX;
    const dy = this.endY - this.startY;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return false;
    }

    const t = Math.max(
      0,
      Math.min(1, ((x - this.startX) * dx + (y - this.startY) * dy) / lengthSquared),
    );

    const closestX = this.startX + t * dx;
    const closestY = this.startY + t * dy;
    const distance = Math.hypot(x - closestX, y - closestY);
    const tolerance = Math.max(this.handleRadius, this.strokeWidth + 4);

    if (distance <= tolerance) {
      this._hitZone = 'line';
      return true;
    }

    return false;
  }

  public getBoundingBox(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(Math.min(this.startX, this.endX), Math.min(this.startY, this.endY)),
      new Vector2(Math.max(this.startX, this.endX), Math.max(this.startY, this.endY)),
    );
  }

  public setBoundingBox(bounds: BoundingBox2D): void {
    this.startX = bounds.min.x;
    this.startY = bounds.min.y;
    this.endX = bounds.max.x;
    this.endY = bounds.max.y;

    this.syncHandles();
  }

  protected override render() {
    return html``;
  }

  private syncHandles(): void {
    this.startCircle.x = this.startX;
    this.startCircle.y = this.startY;
    this.startCircle.radius = this.handleRadius;
    this.startCircle.fill = this.handleFill;
    this.startCircle.stroke = this.handleStroke;
    this.startCircle.strokeWidth = this.handleStrokeWidth;

    this.endCircle.x = this.endX;
    this.endCircle.y = this.endY;
    this.endCircle.radius = this.handleRadius;
    this.endCircle.fill = this.handleFill;
    this.endCircle.stroke = this.handleStroke;
    this.endCircle.strokeWidth = this.handleStrokeWidth;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-edge-shape": EdgeShape;
  }
}