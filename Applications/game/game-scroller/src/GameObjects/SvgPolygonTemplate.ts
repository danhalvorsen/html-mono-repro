import { Polygon, SvgPolygon } from "@monorepo/game-assets-shapes";
import type { Point2 } from "@monorepo/core-math";
import { html, type TemplateResult } from "lit";
import { BaseGameObjectShapeTemplate } from "./BaseGameObjectShapeTemplate.js";

export type SvgPolygonTemplateOptions = {
  readonly width: number;
  readonly height: number;
  readonly points: readonly Point2[];
  readonly fill: string;
  readonly stroke: string;
  readonly strokeWidth: number;
};

export class SvgPolygonTemplate extends BaseGameObjectShapeTemplate {
  public constructor(private readonly options: SvgPolygonTemplateOptions) {
    super();
  }

  public override render(): TemplateResult {
    const polygon = new SvgPolygon(new Polygon(this.options.points), {
      fill: this.options.fill,
      stroke: this.options.stroke,
      strokeWidth: this.options.strokeWidth,
    });

    return html`
      <svg
        width=${this.options.width}
        height=${this.options.height}
        viewBox=${`${-this.options.width / 2} ${-this.options.height / 2} ${this.options.width} ${this.options.height}`}
        aria-hidden="true"
      >
        ${polygon.svg}
      </svg>
    `;
  }
}



