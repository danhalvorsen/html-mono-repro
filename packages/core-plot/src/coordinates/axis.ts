import { svg, type TemplateResult } from "lit";

import { CanvasObject, type HitTestContext } from "../core/canvas-object.js";
import type { RenderContext } from "../core/render-context.js";
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
  private layout: AxisLayout | null = null;

  public constructor(id: string, orientation: AxisOrientation, range = new AxisRange()) {
    super(id);
    this.orientation = orientation;
    this.range = range;
  }

  public getRange(): AxisRange {
    return this.range;
  }

  public setLayout(layout: AxisLayout): void {
    this.layout = layout;
  }

  public override render(_context: RenderContext): TemplateResult {
    if (this.layout === null) {
      return svg``;
    }

    const tickMarks = this.layout.tickValues.map((value) => {
      if (this.orientation === "horizontal") {
        const x = this.layout!.startX + ((value - this.range.min) / this.range.span()) * (this.layout!.endX - this.layout!.startX);
        return svg`
          <g>
            <line x1=${x} y1=${this.layout!.zeroY - 7} x2=${x} y2=${this.layout!.zeroY + 7} stroke="#d7d0c3" stroke-width="1.2"></line>
            <text x=${x} y=${this.layout!.zeroY + 24} text-anchor="middle" fill="#d7d0c3" font-size="11" font-family='"IBM Plex Mono", monospace'>${value}</text>
          </g>
        `;
      }

      const y = this.layout!.endY - ((value - this.range.min) / this.range.span()) * (this.layout!.endY - this.layout!.startY);
      return svg`
        <g>
          <line x1=${this.layout!.zeroX - 7} y1=${y} x2=${this.layout!.zeroX + 7} y2=${y} stroke="#d7d0c3" stroke-width="1.2"></line>
          <text x=${this.layout!.zeroX - 14} y=${y + 4} text-anchor="end" fill="#d7d0c3" font-size="11" font-family='"IBM Plex Mono", monospace'>${value}</text>
        </g>
      `;
    });

    return svg`
      <g data-axis-id=${this.id}>
        <line
          x1=${this.layout.startX}
          y1=${this.layout.startY}
          x2=${this.layout.endX}
          y2=${this.layout.endY}
          stroke="#f5efe0"
          stroke-width="2"
        ></line>
        ${tickMarks}
      </g>
    `;
  }

  public override hitTest(_context: HitTestContext): boolean {
    return false;
  }
}
