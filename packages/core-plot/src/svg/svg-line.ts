import { svg, type TemplateResult } from "lit";

import type { SvgStyle } from "./svg-style.js";

export class SvgLine {
  public readonly x1: number;
  public readonly y1: number;
  public readonly x2: number;
  public readonly y2: number;
  public readonly style: Readonly<SvgStyle>;

  public constructor(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    style: Readonly<SvgStyle>,
  ) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.style = Object.freeze({ ...style });
  }

  public render(): TemplateResult {
    return svg`
      <line
        x1=${this.x1}
        y1=${this.y1}
        x2=${this.x2}
        y2=${this.y2}
        stroke=${this.style.stroke ?? "none"}
        stroke-width=${String(this.style.strokeWidth ?? 1)}
        stroke-dasharray=${this.style.strokeDasharray ?? ""}
        opacity=${String(this.style.opacity ?? 1)}
      ></line>
    `;
  }
}
