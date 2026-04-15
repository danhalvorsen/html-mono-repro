import { svg, type TemplateResult } from "lit";

import type { SvgStyle } from "./svg-style.js";

export class SvgCircle {
  public readonly cx: number;
  public readonly cy: number;
  public readonly r: number;
  public readonly style: Readonly<SvgStyle>;

  public constructor(cx: number, cy: number, r: number, style: Readonly<SvgStyle>) {
    this.cx = cx;
    this.cy = cy;
    this.r = r;
    this.style = Object.freeze({ ...style });
  }

  public render(): TemplateResult {
    return svg`
      <circle
        cx=${this.cx}
        cy=${this.cy}
        r=${this.r}
        fill=${this.style.fill ?? "none"}
        stroke=${this.style.stroke ?? "none"}
        stroke-width=${String(this.style.strokeWidth ?? 1)}
        opacity=${String(this.style.opacity ?? 1)}
      ></circle>
    `;
  }
}
