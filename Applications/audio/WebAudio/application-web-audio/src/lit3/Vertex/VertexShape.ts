import { html } from "lit";
import { queryAssignedElements } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../WebComponents/ICanvasContext.js";
import { Shape } from "../WebComponents/Shapes/Shape/Shape.js";
import { MrVexCircleShape } from "./WebComponents/MrVexCircleShape.js";

export abstract class VertexShape extends Shape {
  @queryAssignedElements({ slot: "start", flatten: true })
  protected startSlot!: Element[];

  @queryAssignedElements({ slot: "end", flatten: true })
  protected endSlot!: Element[];

  public override getCenter(): Vector2 {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return new Vector2(0, 0);
    }

    const start = vertices.start.getCenter();
    const end = vertices.end.getCenter();

    return new Vector2(
      (start.x + end.x) * 0.5,
      (start.y + end.y) * 0.5,
    );
  }

  public override setCenter(center: Vector2): void {
    const current = this.getCenter();
    const delta = center.subtract(current);

    this.translateVertices(delta);
  }

  public override getPosition(): Vector2 {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return new Vector2(0, 0);
    }

    const start = vertices.start.getCenter();
    const end = vertices.end.getCenter();

    return new Vector2(
      Math.min(start.x, end.x),
      Math.min(start.y, end.y),
    );
  }

  public override setPosistion(position: Vector2): void {
    const delta = position.subtract(this.getPosition());
    this.translateVertices(delta);
  }

  public override getWidth(): number {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return 0;
    }

    return Math.abs(
      vertices.end.getCenter().x - vertices.start.getCenter().x,
    );
  }

  public override setWidth(width: number): void {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return;
    }

    const start = vertices.start.getCenter();
    const end = vertices.end.getCenter();

    vertices.end.setCenter(
      new Vector2(start.x + Math.max(0, width), end.y),
    );

    this.requestUpdate();
  }

  public override getHeight(): number {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return 0;
    }

    return Math.abs(
      vertices.end.getCenter().y - vertices.start.getCenter().y,
    );
  }

  public override setHeight(height: number): void {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return;
    }

    const start = vertices.start.getCenter();
    const end = vertices.end.getCenter();

    vertices.end.setCenter(
      new Vector2(end.x, start.y + Math.max(0, height)),
    );

    this.requestUpdate();
  }

  public override setSize(width: number, height: number): void {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return;
    }

    const start = vertices.start.getCenter();

    vertices.end.setCenter(
      new Vector2(
        start.x + Math.max(0, width),
        start.y + Math.max(0, height),
      ),
    );

    this.requestUpdate();
  }

  protected override render() {
    return html`
      <slot name="start"></slot>
      <slot name="end"></slot>
    `;
  }

  protected drawVertices(context: ICanvasContext): void {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return;
    }

    vertices.start.draw(context);
    vertices.end.draw(context);
  }

  protected containsVertexPoint(point: Vector2): boolean {
    const vertices = this.getVertexPair();

    if (vertices === null) {
      return false;
    }

    return (
      vertices.start.pointInsideShape(point, "circle") ||
      vertices.end.pointInsideShape(point, "circle")
    );
  }

  protected getVertexPair():
    | {
        start: MrVexCircleShape;
        end: MrVexCircleShape;
      }
    | null {
    const start = this.startSlot[0];
    const end = this.endSlot[0];

    if (
      !(start instanceof MrVexCircleShape) ||
      !(end instanceof MrVexCircleShape)
    ) {
      return null;
    }

    return { start, end };
  }

  private translateVertices(delta: Vector2): void {
    if (delta.x === 0 && delta.y === 0) {
      return;
    }

    const vertices = this.getVertexPair();

    if (vertices === null) {
      return;
    }

    vertices.start.setCenter(vertices.start.getCenter().add(delta));
    vertices.end.setCenter(vertices.end.getCenter().add(delta));
    this.requestUpdate();
  }
}
