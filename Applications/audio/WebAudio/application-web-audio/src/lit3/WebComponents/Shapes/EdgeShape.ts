// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Shapes/EdgeShape.ts

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BoundingBox2D, Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../ICanvasContext.js";
import { CircleShape } from "./CircleShape.js";
import type { IShape } from "./IShape.js";

@customElement("mr-edge-shape")
export class EdgeShape extends LitElement implements IShape {
  @property({ attribute: false }) public p0: Vector2 = new Vector2(30, 20);
  @property({ attribute: false }) public p1: Vector2 = new Vector2(200, 300);

  public get x(): number { return this.p0.x; }
  public set x(value: number) {
    const dx = value - this.p0.x;

    if (this._hitZone === "end") {
      this.p1 = new Vector2(this.p1.x + dx, this.p1.y);
    } else if (this._hitZone === "start") {
      this.p0 = new Vector2(value, this.p0.y);
    } else {
      this.p0 = new Vector2(value, this.p0.y);
      this.p1 = new Vector2(this.p1.x + dx, this.p1.y);
    }
  }

  public get y(): number { return this.p0.y; }
  public set y(value: number) {
    const dy = value - this.p0.y;

    if (this._hitZone === "end") {
      this.p1 = new Vector2(this.p1.x, this.p1.y + dy);
    } else if (this._hitZone === "start") {
      this.p0 = new Vector2(this.p0.x, value);
    } else {
      this.p0 = new Vector2(this.p0.x, value);
      this.p1 = new Vector2(this.p1.x, this.p1.y + dy);
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

  private _hitZone: "start" | "end" | "line" = "line";

  public constructor() {
    super();
    this.syncHandles();
  }

  public draw(context: ICanvasContext): void {
    this.syncHandles();

    const { ctx } = context;

    const stroke = this.resolveStringCssVar("--shape-stroke", this.stroke);
    const strokeWidth = this.resolveNumberCssVar("--shape-stroke-width", this.strokeWidth);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.p0.x, this.p0.y);
    ctx.lineTo(this.p1.x, this.p1.y);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    ctx.restore();

    this.startCircle.draw(context);
    this.endCircle.draw(context);
  }

  public containsPoint(point: Vector2): boolean {
    if (this.startCircle.containsPoint(point)) {
      this._hitZone = "start";
      return true;
    }

    if (this.endCircle.containsPoint(point)) {
      this._hitZone = "end";
      return true;
    }

    const dx = this.p1.x - this.p0.x;
    const dy = this.p1.y - this.p0.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return false;
    }

    const t = Math.max(
      0,
      Math.min(1, ((point.x - this.p0.x) * dx + (point.y - this.p0.y) * dy) / lengthSquared),
    );

    const closestX = this.p0.x + t * dx;
    const closestY = this.p0.y + t * dy;
    const distance = Math.hypot(point.x - closestX, point.y - closestY);

    const handleRadius = this.resolveNumberCssVar("--handle-radius", this.handleRadius);
    const strokeWidth = this.resolveNumberCssVar("--shape-stroke-width", this.strokeWidth);
    const tolerance = Math.max(handleRadius, strokeWidth + 4);

    if (distance <= tolerance) {
      this._hitZone = "line";
      return true;
    }

    return false;
  }

  public getBoundingBox(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(Math.min(this.p0.x, this.p1.x), Math.min(this.p0.y, this.p1.y)),
      new Vector2(Math.max(this.p0.x, this.p1.x), Math.max(this.p0.y, this.p1.y)),
    );
  }

  public setBoundingBox(bounds: BoundingBox2D): void {
    this.p0 = new Vector2(bounds.min.x, bounds.min.y);
    this.p1 = new Vector2(bounds.max.x, bounds.max.y);

    this.syncHandles();
  }

  protected override render() {
    return html``;
  }

  private syncHandles(): void {
    const handleRadius = this.resolveNumberCssVar("--handle-radius", this.handleRadius);
    const handleFill = this.resolveStringCssVar("--handle-fill", this.handleFill);
    const handleStroke = this.resolveStringCssVar("--handle-stroke", this.handleStroke);
    const handleStrokeWidth = this.resolveNumberCssVar("--handle-stroke-width", this.handleStrokeWidth);

    this.startCircle.x = this.p0.x;
    this.startCircle.y = this.p0.y;
    this.startCircle.radius = handleRadius;
    this.startCircle.fill = handleFill;
    this.startCircle.stroke = handleStroke;
    this.startCircle.strokeWidth = handleStrokeWidth;

    this.endCircle.x = this.p1.x;
    this.endCircle.y = this.p1.y;
    this.endCircle.radius = handleRadius;
    this.endCircle.fill = handleFill;
    this.endCircle.stroke = handleStroke;
    this.endCircle.strokeWidth = handleStrokeWidth;
  }

  private resolveStringCssVar(name: string, fallback: string): string {
    const value = getComputedStyle(this).getPropertyValue(name).trim();
    return value !== "" ? value : fallback;
  }

  private resolveNumberCssVar(name: string, fallback: number): number {
    const value = getComputedStyle(this).getPropertyValue(name).trim();

    if (value === "") {
      return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-edge-shape": EdgeShape;
  }
}