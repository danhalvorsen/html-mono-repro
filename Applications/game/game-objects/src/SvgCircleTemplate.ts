import { html, type TemplateResult } from "lit";
import { BaseGameObjectShapeTemplate } from "./BaseGameObjectShapeTemplate.js";

export type SvgCircleTemplateOptions = {
  readonly width: number;
  readonly height: number;
  readonly radius: number;
  readonly fill: string;
  readonly stroke: string;
  readonly strokeWidth: number;
};

export class SvgCircleTemplate extends BaseGameObjectShapeTemplate {
  public constructor(private readonly options: SvgCircleTemplateOptions) {
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
        <circle
          cx="0"
          cy="0"
          r=${this.options.radius}
          fill=${this.options.fill}
          stroke=${this.options.stroke}
          stroke-width=${this.options.strokeWidth}
        ></circle>
      </svg>
    `;
  }
}
