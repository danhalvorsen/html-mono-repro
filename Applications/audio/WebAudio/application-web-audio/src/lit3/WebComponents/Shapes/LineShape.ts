// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Shapes/LineShape.ts

import { html } from "lit";
import { customElement, property, queryAssignedElements } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../ICanvasContext.js";
import type { IShape } from "./Shape/IShape.js";
import { Shape, ShapeType } from "./Shape/Shape.js";

type ShapeWrapper = {
  readonly shape: Shape;
};

@customElement("mr-line-shape")
export class LineShape extends Shape {
  public pointInsideShape(point: Vector2, _type: ShapeType): boolean {
    return this.containsPoint(point);
  }

  @queryAssignedElements({ slot: "start", flatten: true })
  private startSlot!: Element[];

  @queryAssignedElements({ slot: "end", flatten: true })
  private endSlot!: Element[];

  @property({ type: String })
  public stroke = "#60a5fa";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 1.5;

  public override getPosition(): Vector2 {
    const { start, end } = this.getVertices();

    const s = start.getCenter();
    const e = end.getCenter();

    return new Vector2(
      Math.min(s.x, e.x),
      Math.min(s.y, e.y),
    );
  }

  public override setPosistion(position: Vector2): void {
    const current = this.getPosition();
    const delta = position.subtract(current);

    const { start, end } = this.getVertices();

    start.setCenter(start.getCenter().add(delta));
    end.setCenter(end.getCenter().add(delta));

    this.requestUpdate();
  }

  public override getWidth(): number {
    const { start, end } = this.getVertices();
    return Math.abs(end.getCenter().x - start.getCenter().x);
  }

  public override setWidth(width: number): void {
    const { start, end } = this.getVertices();
    const startCenter = start.getCenter();
    const endCenter = end.getCenter();

    end.setCenter(new Vector2(startCenter.x + Math.max(0, width), endCenter.y));
    this.requestUpdate();
  }

  public override getHeight(): number {
    const { start, end } = this.getVertices();
    return Math.abs(end.getCenter().y - start.getCenter().y);
  }

  public override setHeight(height: number): void {
    const { start, end } = this.getVertices();
    const startCenter = start.getCenter();
    const endCenter = end.getCenter();

    end.setCenter(new Vector2(endCenter.x, startCenter.y + Math.max(0, height)));
    this.requestUpdate();
  }

  public containsPoint(point: Vector2): boolean {
    const { start, end } = this.getVertices();

    if (start.pointInsideShape(point, "circle")) {
      return true;
    }

    if (end.pointInsideShape(point, "circle")) {
      return true;
    }

    const s = start.getCenter();
    const e = end.getCenter();

    const dx = e.x - s.x;
    const dy = e.y - s.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return false;
    }

    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - s.x) * dx + (point.y - s.y) * dy) / lengthSquared,
      ),
    );

    const closestX = s.x + t * dx;
    const closestY = s.y + t * dy;
    const distance = Math.hypot(point.x - closestX, point.y - closestY);

    return distance <= this.strokeWidth + 4;
  }

  public draw(context: ICanvasContext): void {
    const { ctx } = context;
    const { start, end } = this.getVertices();

    const s = start.getCenter();
    const e = end.getCenter();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.strokeWidth;
    ctx.stroke();
    ctx.restore();

    start.draw(context);
    end.draw(context);
  }

  protected override render() {
    return html`
      <slot name="start"></slot>
      <slot name="end"></slot>
    `;
  }

  private getVertices(): { start: IShape; end: IShape } {
    const start = this.resolveVertex(this.startSlot[0], "start");
    const end = this.resolveVertex(this.endSlot[0], "end");

    return { start, end };
  }

  private resolveVertex(
    element: Element | undefined,
    slotName: "start" | "end",
  ): IShape {
    if (element instanceof Shape) {
      return element;
    }

    if (this.isShapeWrapper(element)) {
      return element.shape;
    }

    throw new Error(`mr-line-shape requires a ${slotName} vertex Shape.`);
  }

  private isShapeWrapper(value: unknown): value is ShapeWrapper {
    return (
      typeof value === "object" &&
      value !== null &&
      "shape" in (value as object) &&
      (value as { shape?: unknown }).shape instanceof Shape
    );
  }
}