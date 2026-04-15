import { svg, type TemplateResult } from "lit";
import type { Point2 } from "@monorepo/core-math";
import type { IShape } from "./ishape.js";
import {
  getStyleFill,
  getStyleFontFamily,
  getStyleFontSize,
  getStyleFontWeight,
  getStyleOpacity,
  getStyleVisible,
  type SvgStyle,
} from "./svg-style.js";

import { SvgLine } from "./svg-line.js";

export class TickSvg implements IShape<TickSvg> {
  public readonly line: SvgLine;
  public readonly labelPosition: Point2;
  public readonly label: string;
  public readonly anchor: "start" | "middle" | "end";
  public readonly style: Readonly<SvgStyle>;

  public constructor(
    line: SvgLine,
    labelPosition: Point2,
    label: string,
    anchor: "start" | "middle" | "end",
    style: Readonly<SvgStyle> = Object.freeze({}),
  ) {
    this.line = line;
    this.labelPosition = Object.freeze({ ...labelPosition });
    this.label = label;
    this.anchor = anchor;
    this.style = Object.freeze({ ...style });
  }

  public getStyle(): Readonly<SvgStyle> {
    return this.style;
  }

  public withStyle(style: Readonly<SvgStyle>): TickSvg {
    return new TickSvg(this.line, this.labelPosition, this.label, this.anchor, style);
  }

  public withStylePatch(style: Readonly<Partial<SvgStyle>>): TickSvg {
    return this.withStyle(Object.freeze({ ...this.style, ...style }));
  }

  public render(): TemplateResult {
    if (getStyleVisible(this.style) === false) {
      return svg`${this.line.render()}`;
    }

    return svg`
      <g>
        ${this.line.render()}
        <text
          x=${this.labelPosition.x}
          y=${this.labelPosition.y}
          text-anchor=${this.anchor}
          fill=${getStyleFill(this.style, "currentColor")}
          font-size=${String(getStyleFontSize(this.style, 11))}
          font-family=${getStyleFontFamily(this.style)}
          font-weight=${String(getStyleFontWeight(this.style))}
          opacity=${String(getStyleOpacity(this.style))}
        >
          ${this.label}
        </text>
      </g>
    `;
  }
}
