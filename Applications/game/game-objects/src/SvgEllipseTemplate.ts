import { html, type TemplateResult } from "lit";
import { BaseGameObjectShapeTemplate } from "./BaseGameObjectShapeTemplate.js";

export type SvgEllipseTemplateOptions = {
  readonly width: number;
  readonly height: number;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly fill: string;
  readonly stroke: string;
  readonly strokeWidth: number;
};

export class SvgEllipseTemplate extends BaseGameObjectShapeTemplate {
  public constructor(private readonly options: SvgEllipseTemplateOptions) {
    super();
  }

  public override render(): TemplateResult {
    return html`
      <svg
        width=${this.options.width}
        height=${this.options.height}
        viewBox=${`${-this.options.width / 2} ${-this.options.height / 2} ${this.options.width} ${this.options.height}`}
        aria-hidden="true"
      >
        <ellipse
          cx="0"
          cy="0"
          rx=${this.options.radiusX}
          ry=${this.options.radiusY}
          fill=${this.options.fill}
          stroke=${this.options.stroke}
          stroke-width=${this.options.strokeWidth}
        ></ellipse>
      </svg>
    `;
  }
}
