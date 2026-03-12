// src/lit3/WebComponents/Shapes/MrRect.ts

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BoundingBox2D, Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../ICanvasContext.js";
import type { IShape } from "./IShape.js";

@customElement("mr-rect")
export class MrRect extends LitElement implements IShape {
  @property({ attribute: false })
  public bounds: BoundingBox2D = new BoundingBox2D(
    new Vector2(0, 0),
    new Vector2(100, 60),
  );

  @property({ type: String })
  public fill = "#4caf50";

  public get x(): number {
    return this.bounds.min.x;
  }

  public set x(value: number) {
    const width = this.bounds.width();

    this.bounds = new BoundingBox2D(
      new Vector2(value, this.bounds.min.y),
      new Vector2(value + width, this.bounds.max.y),
    );
  }

  public get y(): number {
    return this.bounds.min.y;
  }

  public set y(value: number) {
    const height = this.bounds.height();

    this.bounds = new BoundingBox2D(
      new Vector2(this.bounds.min.x, value),
      new Vector2(this.bounds.max.x, value + height),
    );
  }

  public get width(): number {
    return this.bounds.width();
  }

  public set width(value: number) {
    const safeWidth = Math.max(0, value);

    this.bounds = new BoundingBox2D(
      this.bounds.min,
      new Vector2(this.bounds.min.x + safeWidth, this.bounds.max.y),
    );
  }

  public get height(): number {
    return this.bounds.height();
  }

  public set height(value: number) {
    const safeHeight = Math.max(0, value);

    this.bounds = new BoundingBox2D(
      this.bounds.min,
      new Vector2(this.bounds.max.x, this.bounds.min.y + safeHeight),
    );
  }

  public getBoundingBox(): BoundingBox2D {
    return this.bounds;
  }

  public setBoundingBox(bounds: BoundingBox2D): void {
    this.bounds = bounds;
  }

  public containsPoint(point: Vector2): boolean {
    return this.bounds.contains(point);
  }

  public draw(context: ICanvasContext): void {
    const ctx = context.ctx;
    const fill =
      getComputedStyle(this).getPropertyValue("--rect-fill").trim() ||
      this.fill;

    ctx.save();
    ctx.fillStyle = fill;
    ctx.fillRect(
      this.bounds.min.x,
      this.bounds.min.y,
      this.bounds.width(),
      this.bounds.height(),
    );
    ctx.restore();
  }

  protected override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-rect": MrRect;
  }
}