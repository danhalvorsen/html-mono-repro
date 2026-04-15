import { svg, type TemplateResult } from "lit";
import type { Point2 } from "@monorepo/core-math";

import type { IShape } from "./ishape.js";
import {
  getStyleFill,
  getStyleOpacity,
  getStyleStroke,
  getStyleStrokeWidth,
  type SvgStyle,
} from "./svg-style.js";

export class SvgCircle implements IShape<SvgCircle> {
  public readonly center: Point2;
  public readonly r: number;
  public readonly style: Readonly<SvgStyle>;

  public constructor(center: Point2, r: number, style: Readonly<SvgStyle>) {
    this.center = Object.freeze({ ...center });
    this.r = r;
    this.style = Object.freeze({ ...style });
  }

  public getStyle(): Readonly<SvgStyle> {
    return this.style;
  }

  public withStyle(style: Readonly<SvgStyle>): SvgCircle {
    return new SvgCircle(this.center, this.r, style);
  }

  public withStylePatch(style: Readonly<Partial<SvgStyle>>): SvgCircle {
    return this.withStyle(Object.freeze({ ...this.style, ...style }));
  }

  public render(): TemplateResult {
    return svg`
      <circle
        cx=${this.center.x}
        cy=${this.center.y}
        r=${this.r}
        fill=${getStyleFill(this.style)}
        stroke=${getStyleStroke(this.style)}
        stroke-width=${String(getStyleStrokeWidth(this.style))}
        opacity=${String(getStyleOpacity(this.style))}
      ></circle>
    `;
  }
}
