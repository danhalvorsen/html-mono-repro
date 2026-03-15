// ============================================================================
// VEX GEOMETRY (independent of Shape)
// ============================================================================

import { Vector2 } from "@monorepo/core-math";
import type { ICanvasContext } from "../WebComponents/ICanvasContext.js";
import type { ShapeType } from "../WebComponents/Shapes/Shape/Shape.js";
import type { IShape } from "../WebComponents/Shapes/Shape/IShape.js";

// ============================================================================
// VEX GEOMETRY
// ============================================================================

export class VexVertex {

  public constructor(
    private position: Vector2,
    private radius: number = 6,
    private visible: boolean = true,
    private draggable: boolean = true,
  ) {}

  public getPosition(): Vector2 {
    return this.position;
  }

  public setPosition(position: Vector2): void {
    this.position = position;
  }

  public getRadius(): number {
    return this.radius;
  }

  public setRadius(radius: number): void {
    this.radius = Math.max(0, radius);
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public setVisible(value: boolean): void {
    this.visible = value;
  }

  public isDraggable(): boolean {
    return this.draggable;
  }

  public setDraggable(value: boolean): void {
    this.draggable = value;
  }
}

export class VexLine {
  public constructor(
    private readonly start: VexVertex,
    private readonly end: VexVertex,
    private readonly stroke: string = "#60a5fa",
    private readonly strokeWidth: number = 2,
  ) {}

  public getStart(): VexVertex {
    return this.start;
  }

  public getEnd(): VexVertex {
    return this.end;
  }

  public getStroke(): string {
    return this.stroke;
  }

  public getStrokeWidth(): number {
    return this.strokeWidth;
  }
}

// ============================================================================
// CTX DRAWING CONTRACTS
// ============================================================================

export interface IStrokeStyle {
  readonly stroke: string;
  readonly strokeWidth: number;
}

export interface IFillStrokeStyle extends IStrokeStyle {
  readonly fill: string;
}

export interface ILinePrimitiveRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    start: Vector2,
    end: Vector2,
    style: IStrokeStyle,
  ): void;
}

export interface ICirclePrimitiveRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    center: Vector2,
    radius: number,
    style: IFillStrokeStyle,
  ): void;
}

export interface IVexVertexRenderer {
  render(ctx: CanvasRenderingContext2D, vertex: VexVertex): void;
}

export interface IVexLineRenderer {
  render(ctx: CanvasRenderingContext2D, line: VexLine): void;
}

// ============================================================================
// CTX PRIMITIVE RENDERERS
// ============================================================================

export class CtxLinePrimitiveRenderer implements ILinePrimitiveRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    start: Vector2,
    end: Vector2,
    style: IStrokeStyle,
  ): void {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth;
    ctx.stroke();
  }
}

export class CtxCirclePrimitiveRenderer implements ICirclePrimitiveRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    center: Vector2,
    radius: number,
    style: IFillStrokeStyle,
  ): void {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = style.fill;
    ctx.fill();
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth;
    ctx.stroke();
  }
}

// ============================================================================
// VEX RENDERERS
// ============================================================================

export class VexVertexRenderer implements IVexVertexRenderer {
  private static readonly defaultStyle: IFillStrokeStyle = {
    fill: "#ffffff",
    stroke: "#1f2937",
    strokeWidth: 1,
  };

  public constructor(
    private readonly circleRenderer: ICirclePrimitiveRenderer,
    private readonly style: IFillStrokeStyle = VexVertexRenderer.defaultStyle,
  ) {}

  public render(ctx: CanvasRenderingContext2D, vertex: VexVertex): void {
    if (!vertex.isVisible()) {
      return;
    }

    this.circleRenderer.render(
      ctx,
      vertex.getPosition(),
      vertex.getRadius(),
      this.style,
    );
  }
}

export class VexLineRenderer implements IVexLineRenderer {
  public constructor(
    private readonly lineRenderer: ILinePrimitiveRenderer,
    private readonly vertexRenderer: IVexVertexRenderer,
  ) {}

  public render(ctx: CanvasRenderingContext2D, line: VexLine): void {
    const start = line.getStart().getPosition();
    const end = line.getEnd().getPosition();

    ctx.save();

    this.lineRenderer.render(ctx, start, end, {
      stroke: line.getStroke(),
      strokeWidth: line.getStrokeWidth(),
    });

    this.vertexRenderer.render(ctx, line.getStart());
    this.vertexRenderer.render(ctx, line.getEnd());

    ctx.restore();
  }
}

// ============================================================================
// ADAPTER INTO EXISTING SHAPE PIPELINE
// ============================================================================

export class VexLineShapeAdapter implements IShape {
  public constructor(
    private readonly line: VexLine,
    private readonly renderer: IVexLineRenderer,
    private readonly hitTolerance: number = 6,
  ) {}

  public getId(): string {
    return "vex-line";
  }

  public getCenter(): Vector2 {
    const s = this.line.getStart().getPosition();
    const e = this.line.getEnd().getPosition();

    return new Vector2(
      (s.x + e.x) * 0.5,
      (s.y + e.y) * 0.5,
    );
  }

  public setCenter(center: Vector2): void {
    const current = this.getCenter();
    const delta = center.subtract(current);

    const start = this.line.getStart();
    const end = this.line.getEnd();

    start.setPosition(start.getPosition().add(delta));
    end.setPosition(end.getPosition().add(delta));
  }

  public getPosition(): Vector2 {
    const s = this.line.getStart().getPosition();
    const e = this.line.getEnd().getPosition();

    return new Vector2(
      Math.min(s.x, e.x),
      Math.min(s.y, e.y),
    );
  }

  public setPosistion(position: Vector2): void {
    const current = this.getPosition();
    const delta = position.subtract(current);

    const start = this.line.getStart();
    const end = this.line.getEnd();

    start.setPosition(start.getPosition().add(delta));
    end.setPosition(end.getPosition().add(delta));
  }

  public getWidth(): number {
    const s = this.line.getStart().getPosition();
    const e = this.line.getEnd().getPosition();

    return Math.abs(e.x - s.x);
  }

  public setWidth(width: number): void {
    const start = this.line.getStart();
    const end = this.line.getEnd();
    const s = start.getPosition();
    const e = end.getPosition();

    end.setPosition(new Vector2(s.x + Math.max(0, width), e.y));
  }

  public getHeight(): number {
    const s = this.line.getStart().getPosition();
    const e = this.line.getEnd().getPosition();

    return Math.abs(e.y - s.y);
  }

  public setHeight(height: number): void {
    const start = this.line.getStart();
    const end = this.line.getEnd();
    const s = start.getPosition();
    const e = end.getPosition();

    end.setPosition(new Vector2(e.x, s.y + Math.max(0, height)));
  }

  public setSize(width: number, height: number): void {
    const s = this.line.getStart().getPosition();
    const end = this.line.getEnd();

    end.setPosition(
      new Vector2(
        s.x + Math.max(0, width),
        s.y + Math.max(0, height),
      ),
    );
  }

public pointInsideShape(point: Vector2, _type: ShapeType): boolean {
  const start = this.line.getStart();
  const end = this.line.getEnd();

  if (this.pointInsideVertex(point, start)) {
    return true;
  }

  if (this.pointInsideVertex(point, end)) {
    return true;
  }

  const s = start.getPosition();
  const e = end.getPosition();

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

  return distance <= this.hitTolerance;
}

  public draw(context: ICanvasContext): void {
    this.renderer.render(context.ctx, this.line);
  }

  private pointInsideVertex(point: Vector2, vertex: VexVertex): boolean {
    if (!vertex.isVisible()) {
      return false;
    }

    const center = vertex.getPosition();
    const radius = vertex.getRadius();

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return dx * dx + dy * dy <= radius * radius;
  }
}

// ============================================================================
// COMPOSITION ROOT
// ============================================================================

export class VexLineShapeAdapterFactory {
  public create(line: VexLine): VexLineShapeAdapter {
    const circleRenderer = new CtxCirclePrimitiveRenderer();
    const lineRenderer = new CtxLinePrimitiveRenderer();
    const vertexRenderer = new VexVertexRenderer(circleRenderer);
    const vexLineRenderer = new VexLineRenderer(lineRenderer, vertexRenderer);

    return new VexLineShapeAdapter(line, vexLineRenderer);
  }
}

// ============================================================================
// USAGE
// ============================================================================

const start = new VexVertex(new Vector2(80, 80), 10, true, true);
const end = new VexVertex(new Vector2(220, 160), 10, true, true);

const line = new VexLine(start, end);
const adapter = new VexLineShapeAdapterFactory().create(line);

// adapter is IShape and can be consumed by your existing drawing pipeline