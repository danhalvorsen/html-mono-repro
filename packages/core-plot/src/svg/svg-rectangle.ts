import { svg, type TemplateResult } from "lit";
import type { Rectangle2 } from "@monorepo/core-math";

import type { SvgStyle } from "./svg-style.js";

export class SvgRectangle {
  public readonly bounds: Rectangle2;
  public readonly rx: number;
  public readonly style: Readonly<SvgStyle>;

  public constructor(
    bounds: Rectangle2,
    rx: number,
    style: Readonly<SvgStyle>,
  ) {
    this.bounds = Object.freeze({ ...bounds });
    this.rx = rx;
    this.style = Object.freeze({ ...style });
  }

  public render(): TemplateResult {
    return svg`
      <rect
        x=${this.bounds.x}
        y=${this.bounds.y}
        width=${this.bounds.width}
        height=${this.bounds.height}
        rx=${this.rx}
        fill=${this.style.fill ?? "none"}
        stroke=${this.style.stroke ?? "none"}
        stroke-width=${String(this.style.strokeWidth ?? 1)}
        opacity=${String(this.style.opacity ?? 1)}
      ></rect>
    `;
  }
}
