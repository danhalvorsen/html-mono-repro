import { svg, type TemplateResult } from "lit";

import {
  CanvasObject,
  type CanvasObjectBounds,
  type HitTestContext,
} from "../core/canvas-object.js";
import type { RenderContext } from "../core/render-context.js";
import { AxisVisualFactory } from "../factories/axis-visual-factory.js";
import { AxisRange } from "./axis-range.js";

export type AxisOrientation = "horizontal" | "vertical";

interface AxisLayout {
  readonly startX: number;
  readonly startY: number;
  readonly endX: number;
  readonly endY: number;
  readonly zeroX: number;
  readonly zeroY: number;
  readonly tickValues: readonly number[];
}

export class Axis extends CanvasObject {
  private readonly orientation: AxisOrientation;
  private readonly range: AxisRange;
  private readonly visualFactory: AxisVisualFactory;
  private layout: AxisLayout | null = null;

  public constructor(id: string, orientation: AxisOrientation, range = new AxisRange()) {
    super(id);
    this.orientation = orientation;
    this.range = range;
    this.visualFactory = new AxisVisualFactory();
  }

  public getRange(): AxisRange {
    return this.range;
  }

  public createWorkingRange(min: number, max: number): AxisRange {
    return new AxisRange(min, max);
  }

  public override getCapabilities() {
    return {
      clickable: true,
      draggable: true,
      doubleClickable: true,
    };
  }

  public setLayout(layout: AxisLayout): void {
    this.layout = layout;
  }

  public override getBounds(_context: RenderContext): CanvasObjectBounds | null {
    if (this.layout === null) {
      return null;
    }

    if (this.orientation === "horizontal") {
      return {
        x: Math.min(this.layout.startX, this.layout.endX),
        y: this.layout.startY - 16,
        width: Math.abs(this.layout.endX - this.layout.startX),
        height: 32,
      };
    }

    return {
      x: this.layout.startX - 16,
      y: Math.min(this.layout.startY, this.layout.endY),
      width: 32,
      height: Math.abs(this.layout.endY - this.layout.startY),
    };
  }

  public override render(_context: RenderContext): TemplateResult {
    if (this.layout === null) {
      return svg``;
    }

    const visual = this.visualFactory.create({
      orientation: this.orientation,
      startX: this.layout.startX,
      startY: this.layout.startY,
      endX: this.layout.endX,
      endY: this.layout.endY,
      zeroX: this.layout.zeroX,
      zeroY: this.layout.zeroY,
      tickValues: this.layout.tickValues,
      rangeMin: this.range.min,
      rangeMax: this.range.max,
      highlighted: _context.selectedObjectId === this.id,
    });

    return svg`
      <g data-axis-id=${this.id}>
        ${visual.line.render()}
        ${visual.arrows.map((arrow) => arrow.render())}
        ${visual.ticks.map((tick) => tick.render())}
      </g>
    `;
  }

  public override hitTest(context: HitTestContext): boolean {
    if (this.layout === null) {
      return false;
    }

    const tolerance = 12;
    if (this.orientation === "horizontal") {
      const minX = Math.min(this.layout.startX, this.layout.endX);
      const maxX = Math.max(this.layout.startX, this.layout.endX);
      return (
        context.x >= minX &&
        context.x <= maxX &&
        Math.abs(context.y - this.layout.startY) <= tolerance
      );
    }

    const minY = Math.min(this.layout.startY, this.layout.endY);
    const maxY = Math.max(this.layout.startY, this.layout.endY);
    return (
      context.y >= minY &&
      context.y <= maxY &&
      Math.abs(context.x - this.layout.startX) <= tolerance
    );
  }
}
