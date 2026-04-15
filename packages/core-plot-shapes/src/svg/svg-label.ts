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

export class SvgLabel implements IShape<SvgLabel> {
  public readonly position: Point2;
  public readonly text: string;
  public readonly anchor: "start" | "middle" | "end";
  public readonly style: Readonly<SvgStyle>;

  public constructor(
    position: Point2,
    text: string,
    anchor: "start" | "middle" | "end",
    style: Readonly<SvgStyle> = Object.freeze({}),
  ) {
    this.position = Object.freeze({ ...position });
    this.text = text;
    this.anchor = anchor;
    this.style = Object.freeze({ ...style });
  }

  public getStyle(): Readonly<SvgStyle> {
    return this.style;
  }

  public withStyle(style: Readonly<SvgStyle>): SvgLabel {
    return new SvgLabel(this.position, this.text, this.anchor, style);
  }

  public withStylePatch(style: Readonly<Partial<SvgStyle>>): SvgLabel {
    return this.withStyle(Object.freeze({ ...this.style, ...style }));
  }

  public render(): TemplateResult {
    if (getStyleVisible(this.style) === false) {
      return svg``;
    }

    return svg`
      <text
        x=${this.position.x}
        y=${this.position.y}
        text-anchor=${this.anchor}
        fill=${getStyleFill(this.style, "currentColor")}
        font-size=${String(getStyleFontSize(this.style))}
        font-family=${getStyleFontFamily(this.style)}
        font-weight=${String(getStyleFontWeight(this.style))}
        opacity=${String(getStyleOpacity(this.style))}
      >
        ${this.text}
      </text>
    `;
  }
}
