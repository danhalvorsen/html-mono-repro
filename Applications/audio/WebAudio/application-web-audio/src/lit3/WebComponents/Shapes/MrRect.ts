
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../ICanvasContext.js";
import { Shape } from "./Shape/Shape.js";
import { Vector2CenterConverter } from "./Vector2CenterConverter.js";

const centerConverter = new Vector2CenterConverter(new Vector2(50, 30));
const dimConverter = new Vector2CenterConverter(new Vector2(100, 60));

@customElement("mr-rect")
export class MrRect extends Shape {
  @property({ attribute: false })
  public position: Vector2 = new Vector2(0, 0);

  @property({ attribute: false })
  public dimensions: Vector2 = new Vector2(100, 60);

  @property({ attribute: "center", converter: centerConverter })
  public get center(): Vector2 {
    return this.getCenter();
  }

  public set center(value: Vector2) {
    this.setCenter(value);
  }

  @property({ attribute: "dim", converter: dimConverter })
  public get dim(): Vector2 {
    return this.dimensions;
  }

  public set dim(value: Vector2) {
    this.setSize(value.x, value.y);
  }

  @property({ type: String })
  public fill = "#4caf50";

  public getPosition(): Vector2 {
    return this.position;
  }

  public setPosistion(position: Vector2): void {
    this.position = position;
    this.requestUpdate();
  }

  public getWidth(): number {
    return this.dimensions.x;
  }

  public setWidth(width: number): void {
    this.dimensions = new Vector2(Math.max(0, width), this.dimensions.y);
    this.requestUpdate();
  }

  public getHeight(): number {
    return this.dimensions.y;
  }

  public setHeight(height: number): void {
    this.dimensions = new Vector2(this.dimensions.x, Math.max(0, height));
    this.requestUpdate();
  }

  public override setSize(width: number, height: number): void {
    this.dimensions = new Vector2(Math.max(0, width), Math.max(0, height));
    this.requestUpdate();
  }

  pointInsideShape(point: Vector2): boolean {
    return this.pointInsidePrimitiveController.pointInsideRect(point, this.position, this.dimensions.x, this.dimensions.y);
  }

  public containsPoint(point: Vector2): boolean {
    const minX = this.position.x;
    const minY = this.position.y;
    const maxX = this.position.x + this.dimensions.x;
    const maxY = this.position.y + this.dimensions.y;

    return (
      point.x >= minX &&
      point.x <= maxX &&
      point.y >= minY &&
      point.y <= maxY
    );
  }

  public draw(context: ICanvasContext): void {
    const { ctx } = context;
    const fill =
      globalThis.getComputedStyle(this).getPropertyValue("--rect-fill").trim() ||
      this.fill;

    ctx.save();
    ctx.fillStyle = fill;
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.dimensions.x,
      this.dimensions.y,
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