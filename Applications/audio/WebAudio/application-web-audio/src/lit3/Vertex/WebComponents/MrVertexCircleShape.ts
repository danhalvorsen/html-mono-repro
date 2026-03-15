import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../../WebComponents/ICanvasContext.js";
import { Vector2CenterConverter } from "../../WebComponents/Shapes/Vector2CenterConverter.js";
import { ShapeType } from "../../WebComponents/Shapes/Shape/Shape.js";
import { VertexShape } from "../VertexShape.js";

import { VexVertex } from "../VexVertex.js";
import { VexVertexRenderer } from "../Renderers/VexVertexRenderer.js";
import { CtxCirclePrimitiveRenderer } from "../Circle/CtxCirclePrimitiveRenderer.js";
 
const centerConverter = new Vector2CenterConverter(new Vector2(60, 60));

@customElement("mr-vex-circle-shape")
export class MrVexCircleShape extends VertexShape {
  private readonly vertex = new VexVertex(new Vector2(60, 60), 10, true, true);

  @property({ attribute: "center", converter: centerConverter })
  public get center(): Vector2 {
    return this.vertex.getPosition();
  }

  public set center(value: Vector2) {
    this.vertex.setPosition(value);
    this.requestUpdate();
  }

  @property({ type: Number })
  public get radius(): number {
    return this.vertex.getRadius();
  }

  public set radius(value: number) {
    this.vertex.setRadius(Math.max(0, value));
    this.requestUpdate();
  }

  @property({ type: String })
  public fill = "#ffffff";

  @property({ type: String })
  public stroke = "#1f2937";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 1;

  protected override getStartPoint(): Vector2 {
    const center = this.vertex.getPosition();
    return new Vector2(center.x - this.vertex.getRadius(), center.y - this.vertex.getRadius());
  }

  protected override getEndPoint(): Vector2 {
    const center = this.vertex.getPosition();
    return new Vector2(center.x + this.vertex.getRadius(), center.y + this.vertex.getRadius());
  }

  protected override setStartPoint(value: Vector2): void {
    const end = this.getEndPoint();

    const width = Math.max(0, end.x - value.x);
    const height = Math.max(0, end.y - value.y);
    const diameter = Math.min(width, height);
    const radius = diameter * 0.5;

    this.vertex.setRadius(radius);
    this.vertex.setPosition(new Vector2(value.x + radius, value.y + radius));
  }

  protected override setEndPoint(value: Vector2): void {
    const start = this.getStartPoint();

    const width = Math.max(0, value.x - start.x);
    const height = Math.max(0, value.y - start.y);
    const diameter = Math.min(width, height);
    const radius = diameter * 0.5;

    this.vertex.setRadius(radius);
    this.vertex.setPosition(new Vector2(start.x + radius, start.y + radius));
  }

  public override getCenter(): Vector2 {
    return this.vertex.getPosition();
  }

  public override setCenter(center: Vector2): void {
    this.vertex.setPosition(center);
    this.requestUpdate();
  }

  public override getPosition(): Vector2 {
    const center = this.vertex.getPosition();
    const radius = this.vertex.getRadius();

    return new Vector2(center.x - radius, center.y - radius);
  }

  public override setPosistion(position: Vector2): void {
    const radius = this.vertex.getRadius();
    this.vertex.setPosition(new Vector2(position.x + radius, position.y + radius));
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

  public override pointInsideShape(point: Vector2, _type: ShapeType): boolean {
    const center = this.vertex.getPosition();
    const radius = this.vertex.getRadius();

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return dx * dx + dy * dy <= radius * radius;
  }

  public override draw(context: ICanvasContext): void {
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