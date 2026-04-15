import { svg, type TemplateResult } from "lit";
import type { Point2 } from "@monorepo/core-math";

import type { IShape } from "./ishape.js";
import {
  getStyleOpacity,
  getStyleStroke,
  getStyleStrokeWidth,
  type SvgStyle,
} from "./svg-style.js";

export class SvgArrow implements IShape<SvgArrow> {
  public readonly tip: Point2;
  public readonly left: Point2;
  public readonly right: Point2;
  public readonly style: Readonly<SvgStyle>;

  public constructor(
    tip: Point2,
    left: Point2,
    right: Point2,
    style: Readonly<SvgStyle>,
  ) {
    this.tip = Object.freeze({ ...tip });
    this.left = Object.freeze({ ...left });
    this.right = Object.freeze({ ...right });
    this.style = Object.freeze({ ...style });
  }

  public getStyle(): Readonly<SvgStyle> {
    return this.style;
  }

  public withStyle(style: Readonly<SvgStyle>): SvgArrow {
    return new SvgArrow(this.tip, this.left, this.right, style);
  }

  public withStylePatch(style: Readonly<Partial<SvgStyle>>): SvgArrow {
    return this.withStyle(Object.freeze({ ...this.style, ...style }));
  }

  public render(): TemplateResult {
    return svg`
      <path
        d="M ${this.left.x} ${this.left.y} L ${this.tip.x} ${this.tip.y} L ${this.right.x} ${this.right.y}"
        fill="none"
        stroke=${getStyleStroke(this.style)}
        stroke-width=${String(getStyleStrokeWidth(this.style))}
        opacity=${String(getStyleOpacity(this.style))}
      ></path>
    `;
  }
}
