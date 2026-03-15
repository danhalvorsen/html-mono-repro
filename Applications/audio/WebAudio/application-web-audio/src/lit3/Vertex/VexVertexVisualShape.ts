// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Shapes/VexVertexVisualShape.ts

import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Point, Vector2 } from "@monorepo/core-math";
import { Vector2CenterConverter } from "../WebComponents/Shapes/Vector2CenterConverter";
import { Shape, ShapeType } from "../WebComponents/Shapes/Shape/Shape";
import { VexVertex } from "./vertex.code";
import { IDraggable } from "../WebComponents/IDraggable";
import { ICanvasContext } from "../WebComponents/ICanvasContext";

const centerConverter = new Vector2CenterConverter(new Vector2(30, 20));

@customElement("mr-vex-vertex-shape")
export class VexVertexVisualShape extends Shape implements IDraggable {
  private readonly vertex = new VexVertex(new Vector2(30, 20), 6, true, true);

  public get shape(): Shape {
    return this;
  }

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
    this.vertex.setRadius(value);
    this.requestUpdate();
  }

  @property({ type: Boolean, reflect: true })
  public get visible(): boolean {
    return this.vertex.isVisible();
  }

  public set visible(value: boolean) {
    this.vertex.setVisible(value);
    this.requestUpdate();
  }

  @property({ type: Boolean, reflect: true })
  public get draggable(): boolean {
    return this.vertex.isDraggable();
  }

  public set draggable(value: boolean) {
    this.vertex.setDraggable(value);
    this.requestUpdate();
  }

  @property({ type: String })
  public fill = "#ffffff";

  @property({ type: String })
  public stroke = "#1f2937";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 1;

  public getVertex(): VexVertex {
    return this.vertex;
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
    if (!this.draggable || !this.visible) {
      return false;
    }

    return this.pointInsideShape(new Vector2(point.x, point.y), "circle");
  }

  public override pointInsideShape(point: Vector2, _type: ShapeType): boolean {
    if (!this.visible || !this.draggable) {
      return false;
    }

    const center = this.vertex.getPosition();
    const radius = this.vertex.getRadius();

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return dx * dx + dy * dy <= radius * radius;
  }

  public override draw(context: ICanvasContext): void {
    if (!this.vertex.isVisible()) {
      return;
    }

    const { ctx } = context;
    const center = this.vertex.getPosition();
    const radius = this.vertex.getRadius();

    ctx.save();
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.fill;
    ctx.fill();
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.strokeWidth;
    ctx.stroke();
    ctx.restore();
  }

  protected override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-vex-vertex-shape": VexVertexVisualShape;
  }
}
