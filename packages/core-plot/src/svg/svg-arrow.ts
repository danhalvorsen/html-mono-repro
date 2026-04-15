import { svg, type TemplateResult } from "lit";

import type { SvgStyle } from "./svg-style.js";

export class SvgArrow {
  public readonly tipX: number;
  public readonly tipY: number;
  public readonly leftX: number;
  public readonly leftY: number;
  public readonly rightX: number;
  public readonly rightY: number;
  public readonly style: Readonly<SvgStyle>;

  public constructor(
    tipX: number,
    tipY: number,
    leftX: number,
    leftY: number,
    rightX: number,
    rightY: number,
    style: Readonly<SvgStyle>,
  ) {
    this.tipX = tipX;
    this.tipY = tipY;
    this.leftX = leftX;
    this.leftY = leftY;
    this.rightX = rightX;
    this.rightY = rightY;
    this.style = Object.freeze({ ...style });
  }

  public render(): TemplateResult {
    return svg`
      <path
        d="M ${this.leftX} ${this.leftY} L ${this.tipX} ${this.tipY} L ${this.rightX} ${this.rightY}"
        fill="none"
        stroke=${this.style.stroke ?? "none"}
        stroke-width=${String(this.style.strokeWidth ?? 1)}
        opacity=${String(this.style.opacity ?? 1)}
      ></path>
    `;
  }
}
