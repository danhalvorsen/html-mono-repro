// DRY fix: extract the repeated vertex-derived geometry into a reusable base class.

// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Shapes/Shape/VertexShape.ts

import { Vector2 } from "@monorepo/core-math";
import { Shape } from "../WebComponents/Shapes/Shape/Shape";
 
export abstract class VertexShape extends Shape {
  protected abstract getStartPoint(): Vector2;
  protected abstract getEndPoint(): Vector2;
  protected abstract setStartPoint(value: Vector2): void;
  protected abstract setEndPoint(value: Vector2): void;

  public override getCenter(): Vector2 {
    const start = this.getStartPoint();
    const end = this.getEndPoint();

    return new Vector2(
      (start.x + end.x) * 0.5,
      (start.y + end.y) * 0.5,
    );
  }

  public override setCenter(center: Vector2): void {
    const delta = center.subtract(this.getCenter());

    this.setStartPoint(this.getStartPoint().add(delta));
    this.setEndPoint(this.getEndPoint().add(delta));
    this.requestUpdate();
  }

  public override getPosition(): Vector2 {
    const start = this.getStartPoint();
    const end = this.getEndPoint();

    return new Vector2(
      Math.min(start.x, end.x),
      Math.min(start.y, end.y),
    );
  }

  public override setPosistion(position: Vector2): void {
    const delta = position.subtract(this.getPosition());

    this.setStartPoint(this.getStartPoint().add(delta));
    this.setEndPoint(this.getEndPoint().add(delta));
    this.requestUpdate();
  }

  public override getWidth(): number {
    const start = this.getStartPoint();
    const end = this.getEndPoint();

    return Math.abs(end.x - start.x);
  }

  public override setWidth(width: number): void {
    const start = this.getStartPoint();
    const end = this.getEndPoint();

    this.setEndPoint(
      new Vector2(start.x + Math.max(0, width), end.y),
    );

    this.requestUpdate();
  }

  public override getHeight(): number {
    const start = this.getStartPoint();
    const end = this.getEndPoint();

    return Math.abs(end.y - start.y);
  }

  public override setHeight(height: number): void {
    const start = this.getStartPoint();
    const end = this.getEndPoint();

    this.setEndPoint(
      new Vector2(end.x, start.y + Math.max(0, height)),
    );

    this.requestUpdate();
  }

  public override setSize(width: number, height: number): void {
    const start = this.getStartPoint();

    this.setEndPoint(
      new Vector2(
        start.x + Math.max(0, width),
        start.y + Math.max(0, height),
      ),
    );

    this.requestUpdate();
  }
}