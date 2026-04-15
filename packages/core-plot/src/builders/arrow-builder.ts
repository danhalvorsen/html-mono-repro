import type { Builder } from "./builder.js";
import { SvgArrow } from "../svg/svg-arrow.js";
import type { SvgStyle } from "../svg/svg-style.js";

export class ArrowBuilder implements Builder<SvgArrow> {
  private tipX = 0;
  private tipY = 0;
  private leftX = 0;
  private leftY = 0;
  private rightX = 0;
  private rightY = 0;
  private style: Readonly<SvgStyle> = Object.freeze({});

  public withPoints(
    tipX: number,
    tipY: number,
    leftX: number,
    leftY: number,
    rightX: number,
    rightY: number,
  ): ArrowBuilder {
    const next = new ArrowBuilder();
    next.tipX = tipX;
    next.tipY = tipY;
    next.leftX = leftX;
    next.leftY = leftY;
    next.rightX = rightX;
    next.rightY = rightY;
    next.style = this.style;
    return next;
  }

  public withStyle(style: Readonly<SvgStyle>): ArrowBuilder {
    const next = new ArrowBuilder();
    next.tipX = this.tipX;
    next.tipY = this.tipY;
    next.leftX = this.leftX;
    next.leftY = this.leftY;
    next.rightX = this.rightX;
    next.rightY = this.rightY;
    next.style = Object.freeze({ ...style });
    return next;
  }

  public build(): SvgArrow {
    return new SvgArrow(
      this.tipX,
      this.tipY,
      this.leftX,
      this.leftY,
      this.rightX,
      this.rightY,
      this.style,
    );
  }
}
