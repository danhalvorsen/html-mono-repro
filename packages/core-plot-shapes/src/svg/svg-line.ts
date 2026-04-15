import { svg, type TemplateResult } from "lit";
import type { Point2 } from "@monorepo/core-math";

import type { IShape } from "./ishape.js";
import {
  getStyleOpacity,
  getStyleStroke,
  getStyleStrokeDasharray,
  getStyleStrokeWidth,
  type SvgStyle,
} from "./svg-style.js";

export class SvgLine implements IShape<SvgLine> {
  public readonly start: Point2;
  public readonly end: Point2;
  public readonly style: Readonly<SvgStyle>;

  public constructor(
    start: Point2,
    end: Point2,
    style: Readonly<SvgStyle>,
  ) {
    this.start = Object.freeze({ ...start });
    this.end = Object.freeze({ ...end });
    this.style = Object.freeze({ ...style });
  }

  public getStyle(): Readonly<SvgStyle> {
    return this.style;
  }

  public withStyle(style: Readonly<SvgStyle>): SvgLine {
    return new SvgLine(this.start, this.end, style);
  }

  public withStylePatch(style: Readonly<Partial<SvgStyle>>): SvgLine {
    return this.withStyle(Object.freeze({ ...this.style, ...style }));
  }

  public render(): TemplateResult {
    return svg`
      <line
        x1=${this.start.x}
        y1=${this.start.y}
        x2=${this.end.x}
        y2=${this.end.y}
        stroke=${getStyleStroke(this.style)}
        stroke-width=${String(getStyleStrokeWidth(this.style))}
        stroke-dasharray=${getStyleStrokeDasharray(this.style)}
        opacity=${String(getStyleOpacity(this.style))}
      ></line>
    `;
  }
}
