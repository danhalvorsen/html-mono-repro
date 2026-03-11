// src/lit3/WebComponents/MrRect.ts

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ICanvasContext } from "../ICanvasContext.js";
import type { IShape } from "./IShape.js";
import { BoundingBox2D } from "@monorepo/core-math";

@customElement("mr-rect")
export class MrRect extends LitElement implements IShape {
  getBoundingBox(): BoundingBox2D {
    return new BoundingBox2D(
      { x: this.x, y: this.y } as any,
      { x: this.x + this.width, y: this.y + this.height } as any,
    );
  }

  setBoundingBox(bounds: BoundingBox2D): void {
    this.x = bounds.min.x;
    this.y = bounds.min.y;

    this.width = bounds.width();
    this.height = bounds.height();
  }
  @property({ type: Number }) public x = 0;
  @property({ type: Number }) public y = 0;
  @property({ type: Number }) public width = 100;
  @property({ type: Number }) public height = 60;
  @property({ type: String }) public fill = "#4caf50";

  public draw(context: ICanvasContext): void {
    const ctx = context.ctx;

    ctx.save();
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  public containsPoint(x: number, y: number): boolean {
    return (
      x >= this.x &&
      y >= this.y &&
      x <= this.x + this.width &&
      y <= this.y + this.height
    );
  }

  protected render() {
    return html``;
  }
}
