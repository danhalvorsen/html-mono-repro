// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Shapes/MrVexLineShape.ts

import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import { VexLineRenderer } from "../Line/VexLineRenderer.js";
import { VexVertexRenderer } from "../Renderers/VexVertexRenderer.js";
import { CtxCirclePrimitiveRenderer } from "../Circle/CtxCirclePrimitiveRenderer.js";
import { CtxLinePrimitiveRenderer } from "../Line/CtxLinePrimitiveRenderer.js";
 
import { VexVertex } from "../VexVertex.js";
import { Vector2CenterConverter } from "../../WebComponents/Shapes/Vector2CenterConverter.js";
import { ShapeType } from "../../WebComponents/Shapes/Shape/Shape.js";
 
import type { ICanvasContext } from "../../WebComponents/ICanvasContext.js";
import { VertexShape } from "../VertexShape.js";
import { VexLine } from "../Line/VexLine.js";

const startConverter = new Vector2CenterConverter(new Vector2(80, 80));
const endConverter = new Vector2CenterConverter(new Vector2(220, 160));

@customElement("mr-vex-line-shape")
export class MrVexLineShape extends VertexShape {
  private readonly startVertex = new VexVertex(new Vector2(80, 80), 10, true, true);
  private readonly endVertex = new VexVertex(new Vector2(220, 160), 10, true, true);
  private readonly line = new VexLine(this.startVertex, this.endVertex);

  @property({ attribute: "start", converter: startConverter })
  public get start(): Vector2 {
    return this.startVertex.getPosition();
  }

  public set start(value: Vector2) {
    this.startVertex.setPosition(value);
    this.requestUpdate();
  }

  @property({ attribute: "end", converter: endConverter })
  public get end(): Vector2 {
    return this.endVertex.getPosition();
  }

  public set end(value: Vector2) {
    this.endVertex.setPosition(value);
    this.requestUpdate();
  }

  @property({ type: Number, attribute: "start-radius" })
  public get startRadius(): number {
    return this.startVertex.getRadius();
  }

  public set startRadius(value: number) {
    this.replaceStartVertex({ radius: Math.max(0, value) });
  }

  @property({ type: Number, attribute: "end-radius" })
  public get endRadius(): number {
    return this.endVertex.getRadius();
  }

  public set endRadius(value: number) {
    this.replaceEndVertex({ radius: Math.max(0, value) });
  }

  @property({ type: String })
  public stroke = "#60a5fa";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 2;

  @property({ type: String })
  public fill = "#ffffff";

  @property({ type: String, attribute: "vertex-stroke" })
  public vertexStroke = "#1f2937";

  @property({ type: Number, attribute: "vertex-stroke-width" })
  public vertexStrokeWidth = 1;

  protected override getStartPoint(): Vector2 {
    return this.startVertex.getPosition();
  }

  protected override getEndPoint(): Vector2 {
    return this.endVertex.getPosition();
  }

  protected override setStartPoint(value: Vector2): void {
    this.startVertex.setPosition(value);
  }

  protected override setEndPoint(value: Vector2): void {
    this.endVertex.setPosition(value);
  }

  public override pointInsideShape(point: Vector2, _type: ShapeType): boolean {
    if (this.pointInsideVertex(point, this.startVertex)) {
      return true;
    }

    if (this.pointInsideVertex(point, this.endVertex)) {
      return true;
    }

    const start = this.getStartPoint();
    const end = this.getEndPoint();

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return false;
    }

    const t = Math.max(
      0,
      Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared),
    );

    const closestX = start.x + t * dx;
    const closestY = start.y + t * dy;
    const distance = Math.hypot(point.x - closestX, point.y - closestY);

    return distance <= Math.max(6, this.strokeWidth * 0.5);
  }

  public override draw(context: ICanvasContext): void {
    const renderer = new VexLineRenderer(
      new CtxLinePrimitiveRenderer(),
      new VexVertexRenderer(new CtxCirclePrimitiveRenderer(), {
        fill: this.fill,
        stroke: this.vertexStroke,
        strokeWidth: this.vertexStrokeWidth,
      }),
    );

    this.line.getStart();
    this.line.getEnd();
    context.ctx.save();
    renderer.render(context.ctx, this.line);
    context.ctx.restore();
  }

  protected override render() {
    return html``;
  }

  private pointInsideVertex(point: Vector2, vertex: VexVertex): boolean {
    const center = vertex.getPosition();
    const radius = vertex.getRadius();

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return dx * dx + dy * dy <= radius * radius;
  }

  private replaceStartVertex(patch: { radius?: number }): void {
    const current = this.startVertex;

    (this as unknown as { startVertex: VexVertex }).startVertex = new VexVertex(
      current.getPosition(),
      patch.radius ?? current.getRadius(),
      true,
      true,
    );

    (this as unknown as { line: VexLine }).line = new VexLine(this.startVertex, this.endVertex);
    this.requestUpdate();
  }

  private replaceEndVertex(patch: { radius?: number }): void {
    const current = this.endVertex;

    (this as unknown as { endVertex: VexVertex }).endVertex = new VexVertex(
      current.getPosition(),
      patch.radius ?? current.getRadius(),
      true,
      true,
    );

    (this as unknown as { line: VexLine }).line = new VexLine(this.startVertex, this.endVertex);
    this.requestUpdate();
  }
}