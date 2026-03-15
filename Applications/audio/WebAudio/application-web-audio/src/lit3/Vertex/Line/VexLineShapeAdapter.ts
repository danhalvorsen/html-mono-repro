import { Vector2 } from "@monorepo/core-math";
import type { IShape } from "../../WebComponents/Shapes/Shape/IShape";
import type { ShapeType } from "../../WebComponents/Shapes/Shape/Shape";
import { IVexLineRenderer } from "./IVLineRenderer";
 
import { VexVertex } from "../VexVertex";
import { ICanvasContext } from "../../WebComponents/ICanvasContext";
import { VexLine } from "./VexLine";

// ============================================================================
// ADAPTER INTO EXISTING SHAPE PIPELINE
// ============================================================================

export class VexLineShapeAdapter implements IShape {
  public constructor(
    private readonly line: VexLine,
    private readonly renderer: IVexLineRenderer,
    private readonly hitTolerance: number = 6
  ) { }

  public getId(): string {
    return "vex-line";
  }

  public getCenter(): Vector2 {
    const s = this.line.getStart().getPosition();
    const e = this.line.getEnd().getPosition();

    return new Vector2(
      (s.x + e.x) * 0.5,
      (s.y + e.y) * 0.5
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
      Math.min(s.y, e.y)
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
        s.y + Math.max(0, height)
      )
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
        ((point.x - s.x) * dx + (point.y - s.y) * dy) / lengthSquared
      )
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
