// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Shapes/MrKnob.ts

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ICanvasContext } from "../ICanvasContext.js";
import type { IShape } from "./IShape.js";
import { BoundingBox2D, Vector2 } from "@monorepo/core-math";
 
@customElement("mr-knob")
export class MrKnob extends LitElement implements IShape {
  containsPoint(point: Vector2): boolean {
    const center = this.getCenter();
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  getBoundingBox(): BoundingBox2D {
    return new BoundingBox2D(
      { x: this.x, y: this.y } as any,
      { x: this.x + this.radius * 2, y: this.y + this.radius * 2 } as any,
    );
  }

  setBoundingBox(bounds: BoundingBox2D): void {
    const size = Math.min(bounds.width(), bounds.height());
    this.radius = size / 2;

    this.x = bounds.min.x;
    this.y = bounds.min.y;
  }
  @property({ type: Number }) public x = 0;
  @property({ type: Number }) public y = 0;

  @property({ type: Number }) public radius = 36;

  /**
   * Number of selectable positions.
   * Example:
   * 10 positions across 90 degrees => 10 deg between positions when endpoints are included.
   */
  @property({ type: Number }) public steps = 10;

  /**
   * Selected position index.
   * Range: 0..steps-1
   */
  @property({ type: Number, attribute: "selected-index" })
  public selectedIndex = 0;

  /**
   * Working area start angle in degrees.
   * 0 deg = right
   * 90 deg = down
   * 180 deg = left
   * 270 deg = up
   *
   * Canvas coordinates are used intentionally.
   */
  @property({ type: Number, attribute: "start-angle-deg" })
  public startAngleDeg = 135;

  /**
   * Working area end angle in degrees.
   */
  @property({ type: Number, attribute: "end-angle-deg" })
  public endAngleDeg = 45;

  /**
   * Include both start and end as valid positions.
   *
   * true:
   *   intervals = steps - 1
   * false:
   *   intervals = steps
   */
  @property({ type: Boolean, attribute: "include-endpoints" })
  public includeEndpoints = true;

  @property({ type: Boolean, attribute: "show-ticks" })
  public showTicks = true;

  @property({ type: Number, attribute: "track-width" })
  public trackWidth = 4;

  @property({ type: Number, attribute: "tick-length" })
  public tickLength = 8;

  @property({ type: Number, attribute: "indicator-length" })
  public indicatorLength = 0.72;

  @property({ type: Number, attribute: "indicator-width" })
  public indicatorWidth = 3;

  @property({ type: String }) public fill = "#4c566a";
  @property({ type: String, attribute: "track-color" }) public trackColor =
    "#2e3440";
  @property({ type: String, attribute: "tick-color" }) public tickColor =
    "#d8dee9";
  @property({ type: String, attribute: "indicator-color" })
  public indicatorColor = "#88c0d0";
  @property({ type: String, attribute: "center-color" }) public centerColor =
    "#eceff4";
  @property({ type: String, attribute: "border-color" }) public borderColor =
    "#1f2430";

  public draw(context: ICanvasContext): void {
    const ctx = context.ctx;

    const safeSteps = this.getSafeSteps();
    const safeIndex = this.clampIndex(this.selectedIndex, safeSteps);
    const center = this.getCenter();
    const startRad = this.toRadians(this.normalizeDeg(this.startAngleDeg));
    const endRad = this.toRadians(this.normalizeDeg(this.endAngleDeg));

    ctx.save();

    this.drawTrack(ctx, center.x, center.y, startRad, endRad);
    if (this.showTicks) {
      this.drawTicks(ctx, center.x, center.y, safeSteps);
    }
    this.drawBody(ctx, center.x, center.y);
    this.drawIndicator(ctx, center.x, center.y, safeIndex, safeSteps);
    this.drawCenterCap(ctx, center.x, center.y);

    ctx.restore();
  }

  public getStepAngleDeg(): number {
    const sweep = this.getSweepAngleDeg();
    const intervals = this.getIntervalCount(this.getSafeSteps());
    return sweep / intervals;
  }

  public getSelectedAngleDeg(): number {
    const safeSteps = this.getSafeSteps();
    const safeIndex = this.clampIndex(this.selectedIndex, safeSteps);
    const stepAngle = this.getStepAngleDeg();

    return this.normalizeDeg(this.startAngleDeg + safeIndex * stepAngle);
  }

  public setSelectedIndex(value: number): void {
    this.selectedIndex = this.clampIndex(value, this.getSafeSteps());
    this.requestUpdate();
  }

  protected override render() {
    return html``;
  }

  private drawTrack(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    startRad: number,
    endRad: number,
  ): void {
    ctx.beginPath();
    ctx.lineWidth = this.trackWidth;
    ctx.strokeStyle = this.trackColor;
    ctx.arc(cx, cy, this.radius + 4, startRad, endRad, false);
    ctx.stroke();
  }

  private drawTicks(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    steps: number,
  ): void {
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.tickColor;

    for (let index = 0; index < steps; index++) {
      const angleDeg = this.getAngleForIndex(index, steps);
      const angleRad = this.toRadians(angleDeg);

      const outerX = cx + Math.cos(angleRad) * (this.radius + 8);
      const outerY = cy + Math.sin(angleRad) * (this.radius + 8);

      const innerX =
        cx + Math.cos(angleRad) * (this.radius + 8 - this.tickLength);
      const innerY =
        cy + Math.sin(angleRad) * (this.radius + 8 - this.tickLength);

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();
    }
  }

  private drawBody(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
  ): void {
    ctx.beginPath();
    ctx.fillStyle = this.fill;
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 2;
    ctx.arc(cx, cy, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private drawIndicator(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    selectedIndex: number,
    steps: number,
  ): void {
    const angleDeg = this.getAngleForIndex(selectedIndex, steps);
    const angleRad = this.toRadians(angleDeg);
    const length = this.radius * this.indicatorLength;

    const tipX = cx + Math.cos(angleRad) * length;
    const tipY = cy + Math.sin(angleRad) * length;

    ctx.beginPath();
    ctx.lineWidth = this.indicatorWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = this.indicatorColor;
    ctx.moveTo(cx, cy);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = this.indicatorColor;
    ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCenterCap(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
  ): void {
    ctx.beginPath();
    ctx.fillStyle = this.centerColor;
    ctx.arc(cx, cy, Math.max(4, this.radius * 0.12), 0, Math.PI * 2);
    ctx.fill();
  }

  private getCenter(): Readonly<{ x: number; y: number }> {
    return {
      x: this.x + this.radius,
      y: this.y + this.radius,
    };
  }

  private getAngleForIndex(index: number, steps: number): number {
    const clampedIndex = this.clampIndex(index, steps);
    const stepAngle = this.getSweepAngleDeg() / this.getIntervalCount(steps);
    return this.normalizeDeg(this.startAngleDeg + clampedIndex * stepAngle);
  }

  private getSweepAngleDeg(): number {
    const start = this.normalizeDeg(this.startAngleDeg);
    const end = this.normalizeDeg(this.endAngleDeg);

    if (end >= start) {
      return end - start;
    }

    return 360 - start + end;
  }

  private getIntervalCount(steps: number): number {
    if (this.includeEndpoints) {
      return Math.max(1, steps - 1);
    }

    return Math.max(1, steps);
  }

  private getSafeSteps(): number {
    return Math.max(1, Math.floor(this.steps));
  }

  private clampIndex(index: number, steps: number): number {
    const safeValue = Number.isFinite(index) ? Math.round(index) : 0;
    return Math.max(0, Math.min(steps - 1, safeValue));
  }

  private normalizeDeg(value: number): number {
    const normalized = value % 360;
    return normalized < 0 ? normalized + 360 : normalized;
  }

  private toRadians(angleDeg: number): number {
    return (angleDeg * Math.PI) / 180;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-knob": MrKnob;
  }
}
