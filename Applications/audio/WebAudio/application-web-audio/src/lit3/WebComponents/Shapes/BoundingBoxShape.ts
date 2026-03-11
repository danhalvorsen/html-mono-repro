import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BoundingBox2D } from "@monorepo/core-math";

import type { ICanvasContext } from "../ICanvasContext.js";
import { EdgeShape } from "./EdgeShape.js";
import { Vector2 } from "../../../../../../../../packages/core-math/dist/implementations/Vector2.js";

@customElement("mr-bounding-box-shape")
export class BoundingBoxShape extends LitElement {

  @property({ type: Number }) public x = 0;
  @property({ type: Number }) public y = 0;
  @property({ type: Number }) public width = 100;
  @property({ type: Number }) public height = 80;

  @property({ type: String }) public stroke = "#60a5fa";
  @property({ type: Number }) public strokeWidth = 1.5;

  private readonly topEdge = new EdgeShape();
  private readonly rightEdge = new EdgeShape();
  private readonly bottomEdge = new EdgeShape();
  private readonly leftEdge = new EdgeShape();

  private readonly edges: readonly EdgeShape[] = [
    this.topEdge,
    this.rightEdge,
    this.bottomEdge,
    this.leftEdge,
  ];

  public constructor() {
    super();
    this.updateEdges();
  }

  public draw(context: ICanvasContext): void {

    this.updateEdges();

    for (const edge of this.edges) {
      edge.draw(context);
    }
  }

 public containsPoint(x: number, y: number): boolean {
  return this.getBoundingBox().contains(new Vector2(x,y));
}

  public getBoundingBox(): BoundingBox2D {
    return new BoundingBox2D(
      { x: this.x, y: this.y } as any,
      { x: this.x + this.width, y: this.y + this.height } as any,
    );
  }

  public setBoundingBox(bounds: BoundingBox2D): void {

    this.x = bounds.min.x;
    this.y = bounds.min.y;

    this.width = bounds.width();
    this.height = bounds.height();

    this.updateEdges();
  }

  protected override render() {
    return html``;
  }

  private updateEdges(): void {

    const x0 = this.x;
    const y0 = this.y;

    const x1 = this.x + this.width;
    const y1 = this.y + this.height;

    this.setEdge(this.topEdge, x0, y0, x1, y0);
    this.setEdge(this.rightEdge, x1, y0, x1, y1);
    this.setEdge(this.bottomEdge, x1, y1, x0, y1);
    this.setEdge(this.leftEdge, x0, y1, x0, y0);

    for (const edge of this.edges) {
      edge.stroke = this.stroke;
      edge.strokeWidth = this.strokeWidth;
    }
  }

  private setEdge(
    edge: EdgeShape,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ): void {

    edge.startX = startX;
    edge.startY = startY;

    edge.endX = endX;
    edge.endY = endY;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-bounding-box-shape": BoundingBoxShape;
  }
}