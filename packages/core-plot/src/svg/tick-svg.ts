import { svg, type TemplateResult } from "lit";

import { SvgLine } from "./svg-line.js";

export class TickSvg {
  public readonly line: SvgLine;
  public readonly labelX: number;
  public readonly labelY: number;
  public readonly label: string;
  public readonly anchor: "start" | "middle" | "end";
  public readonly fill: string;
  public readonly fontFamily: string;

  public constructor(
    line: SvgLine,
    labelX: number,
    labelY: number,
    label: string,
    anchor: "start" | "middle" | "end",
    fill: string,
    fontFamily: string,
  ) {
    this.line = line;
    this.labelX = labelX;
    this.labelY = labelY;
    this.label = label;
    this.anchor = anchor;
    this.fill = fill;
    this.fontFamily = fontFamily;
  }

  public render(): TemplateResult {
    return svg`
      <g>
        ${this.line.render()}
        <text
          x=${this.labelX}
          y=${this.labelY}
          text-anchor=${this.anchor}
          fill=${this.fill}
          font-size="11"
          font-family=${this.fontFamily}
        >
          ${this.label}
        </text>
      </g>
    `;
  }
}
