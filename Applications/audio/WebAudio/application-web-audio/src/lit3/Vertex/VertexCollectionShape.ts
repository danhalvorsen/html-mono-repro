import { html } from "lit";
import { queryAssignedElements } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../WebComponents/ICanvasContext.js";
import { Shape } from "../WebComponents/Shapes/Shape/Shape.js";
import { MrVexCircleShape } from "./WebComponents/MrVexCircleShape.js";

export abstract class VertexCollectionShape extends Shape {
  @queryAssignedElements({ flatten: true })
  protected vertexSlot!: Element[];

  public getVertices(): readonly MrVexCircleShape[] {
    const assigned = this.vertexSlot?.length
      ? this.vertexSlot
      : Array.from(this.children);

    const vertices: MrVexCircleShape[] = [];

    for (const element of assigned) {
      if (element instanceof MrVexCircleShape) {
        vertices.push(element);
      }
    }

    return vertices;
  }

  public override getPosition(): Vector2 {
    const bounds = this.getVertexBounds();
    return bounds === null ? new Vector2(0, 0) : bounds.min;
  }

  public override setPosistion(position: Vector2): void {
    const bounds = this.getVertexBounds();

    if (bounds === null) {
      return;
    }

    this.translateVertices(position.subtract(bounds.min));
  }

  public override getWidth(): number {
    const bounds = this.getVertexBounds();
    return bounds === null ? 0 : bounds.max.x - bounds.min.x;
  }

  public override setWidth(width: number): void {
    this.scaleVertices(Math.max(0, width), this.getHeight());
  }

  public override getHeight(): number {
    const bounds = this.getVertexBounds();
    return bounds === null ? 0 : bounds.max.y - bounds.min.y;
  }

  public override setHeight(height: number): void {
    this.scaleVertices(this.getWidth(), Math.max(0, height));
  }

  public override setSize(width: number, height: number): void {
    this.scaleVertices(Math.max(0, width), Math.max(0, height));
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  protected drawVertices(context: ICanvasContext): void {
    for (const vertex of this.getVertices()) {
      vertex.draw(context);
    }
  }

  protected containsVertexPoint(point: Vector2): boolean {
    for (const vertex of this.getVertices()) {
      if (vertex.pointInsideShape(point, "circle")) {
        return true;
      }
    }

    return false;
  }

  protected getVertexCenters(
    vertices: readonly MrVexCircleShape[] = this.getVertices(),
  ): readonly Vector2[] {
    return vertices.map((vertex) => vertex.getCenter());
  }

  protected getVertexBounds():
    | {
        min: Vector2;
        max: Vector2;
      }
    | null {
    const vertices = this.getVertices();
    const [first, ...rest] = vertices;

    if (first === undefined) {
      return null;
    }

    let minX = first.getCenter().x;
    let minY = first.getCenter().y;
    let maxX = minX;
    let maxY = minY;

    for (const vertex of rest) {
      const center = vertex.getCenter();
      minX = Math.min(minX, center.x);
      minY = Math.min(minY, center.y);
      maxX = Math.max(maxX, center.x);
      maxY = Math.max(maxY, center.y);
    }

    return {
      min: new Vector2(minX, minY),
      max: new Vector2(maxX, maxY),
    };
  }

  protected translateVertices(delta: Vector2): void {
    if (delta.x === 0 && delta.y === 0) {
      return;
    }

    const vertices = this.getVertices();

    if (vertices.length === 0) {
      return;
    }

    for (const vertex of vertices) {
      vertex.setCenter(vertex.getCenter().add(delta));
    }

    this.requestUpdate();
  }

  protected scaleVertices(nextWidth: number, nextHeight: number): void {
    const vertices = this.getVertices();

    if (vertices.length === 0) {
      return;
    }

    const bounds = this.getVertexBounds();

    if (bounds === null) {
      return;
    }

    const currentWidth = bounds.max.x - bounds.min.x;
    const currentHeight = bounds.max.y - bounds.min.y;
    const scaleX = currentWidth === 0 ? 1 : nextWidth / currentWidth;
    const scaleY = currentHeight === 0 ? 1 : nextHeight / currentHeight;

    for (const vertex of vertices) {
      const center = vertex.getCenter();
      vertex.setCenter(
        new Vector2(
          bounds.min.x + (center.x - bounds.min.x) * scaleX,
          bounds.min.y + (center.y - bounds.min.y) * scaleY,
        ),
      );
    }

    this.requestUpdate();
  }
}
