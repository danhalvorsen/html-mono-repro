// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Shapes/EdgeShape.ts

import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../ICanvasContext.js";
import type { IDraggable, Point } from "../IDraggable.js";
import { CircleShape } from "./CircleShape.js";
import { Shape, ShapeType } from "./Shape/Shape.js";
import { Vector2CenterConverter } from "./Vector2CenterConverter.js";

const startConverter = new Vector2CenterConverter(new Vector2(30, 20));
const endConverter = new Vector2CenterConverter(new Vector2(200, 300));

@customElement("mr-edge-shape")
export class EdgeShape extends Shape implements IDraggable {
  private _p0: Vector2 = new Vector2(30, 20);
  private _p1: Vector2 = new Vector2(200, 300);

  public get p0(): Vector2 {
    return this._p0;
  }

  public set p0(value: Vector2) {
    this._p0 = value;
    this.syncHandles();
    this.requestUpdate();
  }

  public get p1(): Vector2 {
    return this._p1;
  }

  public set p1(value: Vector2) {
    this._p1 = value;
    this.syncHandles();
    this.requestUpdate();
  }

  public get shape(): Shape {
    return this;
  }

  @property({ attribute: "start", converter: startConverter })
  public get start(): Vector2 {
    return this.p0;
  }

  public set start(value: Vector2) {
    this.p0 = value;
  }

  @property({ attribute: "end", converter: endConverter })
  public get end(): Vector2 {
    return this.p1;
  }

  public set end(value: Vector2) {
    this.p1 = value;
  }

  @property({ type: String })
  public stroke = "#60a5fa";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 1.5;

  @property({ type: Number, attribute: "handle-radius" })
  public handleRadius = 6;

  @property({ type: String, attribute: "handle-fill" })
  public handleFill = "#ffffff";

  @property({ type: String, attribute: "handle-stroke" })
  public handleStroke = "#1f2937";

  @property({ type: Number, attribute: "handle-stroke-width" })
  public handleStrokeWidth = 1;

  public readonly startCircle = new CircleShape();
  public readonly endCircle = new CircleShape();

  private hitZone: "start" | "end" | "line" = "line";

  public constructor() {
    super();
    this.syncHandles();
  }

  public override getCenter(): Vector2 {
    return new Vector2(
      (this.p0.x + this.p1.x) * 0.5,
      (this.p0.y + this.p1.y) * 0.5,
    );
  }

  public override setCenter(center: Vector2): void {
    const current = this.getCenter();
    const delta = center.subtract(current);

    this._p0 = this._p0.add(delta);
    this._p1 = this._p1.add(delta);

    this.syncHandles();
    this.requestUpdate();
  }

  public override getPosition(): Vector2 {
    return new Vector2(
      Math.min(this.p0.x, this.p1.x),
      Math.min(this.p0.y, this.p1.y),
    );
  }

  public override setPosistion(position: Vector2): void {
    const size = this.getSizeVector();
    this.applyBounds(position, size);
  }

  public setPosition(position: Point): void {
    this.setPosistion(new Vector2(position.x, position.y));
  }

  public override getWidth(): number {
    return Math.abs(this.p1.x - this.p0.x);
  }

  public override setWidth(width: number): void {
    this.applyBounds(
      this.getPosition(),
      new Vector2(Math.max(0, width), this.getHeight()),
    );
  }

  public override getHeight(): number {
    return Math.abs(this.p1.y - this.p0.y);
  }

  public override setHeight(height: number): void {
    this.applyBounds(
      this.getPosition(),
      new Vector2(this.getWidth(), Math.max(0, height)),
    );
  }

  public override setSize(width: number, height: number): void {
    this.applyBounds(
      this.getPosition(),
      new Vector2(Math.max(0, width), Math.max(0, height)),
    );
  }

  public containsPoint(point: Point): boolean;
  public containsPoint(point: Vector2): boolean;
  public containsPoint(point: Point | Vector2): boolean {
    this.syncHandles();

    const probe =
      point instanceof Vector2 ? point : new Vector2(point.x, point.y);

    return this.pointInsideShape(probe, "edge");
  }

  public override pointInsideShape(
    point: Vector2,
    type: ShapeType = "circle",
  ): boolean {
    this.syncHandles();

    if (this.startCircle.pointInsideShape(point, type)) {
      this.hitZone = "start";
      return true;
    }

    if (this.endCircle.pointInsideShape(point, type)) {
      this.hitZone = "end";
      return true;
    }

    const dx = this.p1.x - this.p0.x;
    const dy = this.p1.y - this.p0.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return false;
    }

    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - this.p0.x) * dx + (point.y - this.p0.y) * dy) / lengthSquared,
      ),
    );

    const closestX = this.p0.x + t * dx;
    const closestY = this.p0.y + t * dy;
    const distance = Math.hypot(point.x - closestX, point.y - closestY);
    const tolerance = Math.max(this.handleRadius, this.strokeWidth + 4);

    if (distance <= tolerance) {
      this.hitZone = "line";
      return true;
    }

    return false;
  }

  public draw(context: ICanvasContext): void {
    this.syncHandles();

    const { ctx } = context;
    const stroke = this.resolveStringCssVar("--shape-stroke", this.stroke);
    const strokeWidth = this.resolveNumberCssVar(
      "--shape-stroke-width",
      this.strokeWidth,
    );

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.p0.x, this.p0.y);
    ctx.lineTo(this.p1.x, this.p1.y);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    ctx.restore();

    this.startCircle.draw(context);
    this.endCircle.draw(context);
  }

  protected override render() {
    return html``;
  }

  private getSizeVector(): Vector2 {
    return new Vector2(this.getWidth(), this.getHeight());
  }

  private applyBounds(position: Vector2, size: Vector2): void {
    switch (this.hitZone) {
      case "start":
        this._p0 = new Vector2(position.x, position.y);
        break;

      case "end":
        this._p1 = new Vector2(position.x + size.x, position.y + size.y);
        break;

      default:
        this._p0 = position;
        this._p1 = new Vector2(position.x + size.x, position.y + size.y);
        break;
    }

    this.syncHandles();
    this.requestUpdate();
  }

  private syncHandles(): void {
    const handleRadius = this.resolveNumberCssVar(
      "--handle-radius",
      this.handleRadius,
    );
    const handleFill = this.resolveStringCssVar(
      "--handle-fill",
      this.handleFill,
    );
    const handleStroke = this.resolveStringCssVar(
      "--handle-stroke",
      this.handleStroke,
    );
    const handleStrokeWidth = this.resolveNumberCssVar(
      "--handle-stroke-width",
      this.handleStrokeWidth,
    );

    this.startCircle.center = new Vector2(this.p0.x, this.p0.y);
    this.startCircle.radius = handleRadius;
    this.startCircle.fill = handleFill;
    this.startCircle.stroke = handleStroke;
    this.startCircle.strokeWidth = handleStrokeWidth;

    this.endCircle.center = new Vector2(this.p1.x, this.p1.y);
    this.endCircle.radius = handleRadius;
    this.endCircle.fill = handleFill;
    this.endCircle.stroke = handleStroke;
    this.endCircle.strokeWidth = handleStrokeWidth;
  }

  private resolveStringCssVar(name: string, fallback: string): string {
    const value = globalThis
      .getComputedStyle(this)
      .getPropertyValue(name)
      .trim();

    return value !== "" ? value : fallback;
  }

  private resolveNumberCssVar(name: string, fallback: number): number {
    const value = globalThis
      .getComputedStyle(this)
      .getPropertyValue(name)
      .trim();

    if (value === "") {
      return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}