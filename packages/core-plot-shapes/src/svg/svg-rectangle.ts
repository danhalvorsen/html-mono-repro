import { svg, type TemplateResult } from "lit";
import type { Rectangle2 } from "@monorepo/core-math";

import type { IShape } from "./ishape.js";
import {
  getStyleFill,
  getStyleOpacity,
  getStyleStroke,
  getStyleStrokeWidth,
  type SvgStyle,
} from "./svg-style.js";

export class SvgRectangle implements IShape<SvgRectangle> {
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

  public getStyle(): Readonly<SvgStyle> {
    return this.style;
  }

  public withStyle(style: Readonly<SvgStyle>): SvgRectangle {
    return new SvgRectangle(this.bounds, this.rx, style);
  }

  public withStylePatch(style: Readonly<Partial<SvgStyle>>): SvgRectangle {
    return this.withStyle(Object.freeze({ ...this.style, ...style }));
  }

  public render(): TemplateResult {
    return svg`
      <rect
        x=${this.bounds.x}
        y=${this.bounds.y}
        width=${this.bounds.width}
        height=${this.bounds.height}
        rx=${this.rx}
        ry=${this.rx}
        fill=${getStyleFill(this.style)}
        stroke=${getStyleStroke(this.style)}
        stroke-width=${String(getStyleStrokeWidth(this.style))}
        opacity=${String(getStyleOpacity(this.style))}
      ></rect>
    `;
  }
}
