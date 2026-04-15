import { svg, type TemplateResult } from "lit";

import type { IShape } from "./ishape.js";
import {
  getStyleFill,
  getStyleOpacity,
  getStyleStroke,
  getStyleStrokeDasharray,
  getStyleStrokeWidth,
  type SvgStyle,
} from "./svg-style.js";

export class SvgCurve implements IShape<SvgCurve> {
  public readonly pathData: string;
  public readonly style: Readonly<SvgStyle>;
  public readonly lineCap: "butt" | "round" | "square";
  public readonly lineJoin: "miter" | "round" | "bevel";

  public constructor(
    pathData: string,
    style: Readonly<SvgStyle>,
    lineCap: "butt" | "round" | "square" = "round",
    lineJoin: "miter" | "round" | "bevel" = "round",
  ) {
    this.pathData = pathData;
    this.style = Object.freeze({ ...style });
    this.lineCap = lineCap;
    this.lineJoin = lineJoin;
  }

  public getStyle(): Readonly<SvgStyle> {
    return this.style;
  }

  public withStyle(style: Readonly<SvgStyle>): SvgCurve {
    return new SvgCurve(this.pathData, style, this.lineCap, this.lineJoin);
  }

  public withStylePatch(style: Readonly<Partial<SvgStyle>>): SvgCurve {
    return this.withStyle(Object.freeze({ ...this.style, ...style }));
  }

  public render(): TemplateResult {
    return svg`
      <path
        d=${this.pathData}
        fill=${getStyleFill(this.style)}
        stroke=${getStyleStroke(this.style)}
        stroke-width=${String(getStyleStrokeWidth(this.style))}
        stroke-dasharray=${getStyleStrokeDasharray(this.style)}
        opacity=${String(getStyleOpacity(this.style))}
        stroke-linecap=${this.lineCap}
        stroke-linejoin=${this.lineJoin}
      ></path>
    `;
  }
}
