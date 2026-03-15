// src/lit3/Vertex/Circle/MrVexCircleShape.ts

import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../../WebComponents/ICanvasContext.js";
import type { IDraggable, Point } from "../../WebComponents/IDraggable.js";
import { Shape, type ShapeType } from "../../WebComponents/Shapes/Shape/Shape.js";
import { Vector2CenterConverter } from "../../WebComponents/Shapes/Vector2CenterConverter.js";
import { VexVertex } from "../VexVertex.js";
import { VexVertexRenderer } from "../Renderers/VexVertexRenderer.js";
import { CtxCirclePrimitiveRenderer } from "../Circle/CtxCirclePrimitiveRenderer.js";
 
const centerConverter = new Vector2CenterConverter(new Vector2(60, 60));
const booleanAttributeConverter = {
  fromAttribute(value: string | null): boolean {
    if (value === null) {
      return false;
    }

    const normalized = value.trim().toLowerCase();

    return normalized !== "false" && normalized !== "0" && normalized !== "off";
  },
  toAttribute(value: boolean): string | null {
    return value ? "" : null;
  },
};

@customElement("mr-vex-circle-shape")
export class MrVexCircleShape extends Shape implements IDraggable {
  protected readonly vertex = new VexVertex(new Vector2(60, 60), 10, true, true);

  @property({
    type: String,
    attribute: "vertex-id",
    reflect: true,
  })
  public get vertexId(): string {
    return this.vertex.getId();
  }

  public set vertexId(value: string) {
    this.vertex.setId(value);
    this.requestUpdate();
  }

  @property({
    attribute: "center",
    converter: centerConverter,
    reflect: true,
  })
  public get center(): Vector2 {
    return this.vertex.getPosition();
  }

  public set center(value: Vector2) {
    this.vertex.setPosition(value);
    this.requestUpdate();
  }

  @property({ type: Number, reflect: true })
  public get radius(): number {
    return this.vertex.getRadius();
  }

  public set radius(value: number) {
    this.vertex.setRadius(Math.max(0, value));
    this.requestUpdate();
  }

  @property({ reflect: true, converter: booleanAttributeConverter })
  public get visible(): boolean {
    return this.vertex.isVisible();
  }

  public set visible(value: boolean) {
    this.vertex.setVisible(value);
    this.requestUpdate();
  }

  @property({ reflect: true, converter: booleanAttributeConverter })
  public get draggable(): boolean {
    return this.vertex.isDraggable();
  }

  public set draggable(value: boolean) {
    this.vertex.setDraggable(value);
    this.requestUpdate();
  }

  @property({ type: String, reflect: true })
  public fill = "#ffffff";

  @property({ type: String, reflect: true })
  public stroke = "#1f2937";

  @property({
    type: Number,
    attribute: "stroke-width",
    reflect: true,
  })
  public strokeWidth = 1;

  public get shape(): Shape {
    return this;
  }

  public getVertex(): VexVertex {
    return this.vertex;
  }

  public override getCenter(): Vector2 {
    return this.vertex.getPosition();
  }

  public override setCenter(center: Vector2): void {
    this.center = center;
  }

  public override getPosition(): Vector2 {
    const center = this.vertex.getPosition();
    const radius = this.vertex.getRadius();

    return new Vector2(center.x - radius, center.y - radius);
  }

  public setPosition(position: Point): void {
    if (!this.draggable) {
      return;
    }

    this.setPosistion(new Vector2(position.x, position.y));
  }

  public override setPosistion(position: Vector2): void {
    const radius = this.vertex.getRadius();

    this.vertex.setPosition(
      new Vector2(position.x + radius, position.y + radius),
    );

    this.requestUpdate();
  }

  public override getWidth(): number {
    return this.vertex.getRadius() * 2;
  }

  public override setWidth(width: number): void {
    this.vertex.setRadius(Math.max(0, width * 0.5));
    this.requestUpdate();
  }

  public override getHeight(): number {
    return this.vertex.getRadius() * 2;
  }

  public override setHeight(height: number): void {
    this.vertex.setRadius(Math.max(0, height * 0.5));
    this.requestUpdate();
  }

  public override setSize(width: number, height: number): void {
    this.vertex.setRadius(Math.max(0, Math.min(width, height) * 0.5));
    this.requestUpdate();
  }

  public containsPoint(point: Point): boolean {
    if (!this.visible || !this.draggable) {
      return false;
    }

    return this.pointInsideShape(new Vector2(point.x, point.y), "circle");
  }

  public override pointInsideShape(point: Vector2, _type: ShapeType): boolean {
    if (!this.visible || !this.draggable) {
      return false;
    }

    return this.pointInsidePrimitiveController.pointInsideCircle(
      point,
      this.vertex.getPosition(),
      this.vertex.getRadius(),
    );
  }

  public override draw(context: ICanvasContext): void {
    if (!this.visible) {
      return;
    }

    const renderer = new VexVertexRenderer(
      new CtxCirclePrimitiveRenderer(),
      {
        fill: this.fill,
        stroke: this.stroke,
        strokeWidth: this.strokeWidth,
      },
    );

    context.ctx.save();
    renderer.render(context.ctx, this.vertex);
    context.ctx.restore();
  }

  protected override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-vex-circle-shape": MrVexCircleShape;
  }
}
