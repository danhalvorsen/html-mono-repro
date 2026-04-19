import type { Builder } from "./builder.js";
import type { Point2 } from "@monorepo/core-math";
import { SvgArrow } from "../svg/svg-arrow.js";
import type { SvgStyle } from "../svg/svg-style.js";

export class ArrowBuilder implements Builder<SvgArrow> {
  private tip: Point2 = Object.freeze({ x: 0, y: 0 });
  private left: Point2 = Object.freeze({ x: 0, y: 0 });
  private right: Point2 = Object.freeze({ x: 0, y: 0 });
  private style: Readonly<SvgStyle> = Object.freeze({});

  public withPoints(tip: Point2, left: Point2, right: Point2): ArrowBuilder;
  public withPoints(
    tipX: number,
    tipY: number,
    leftX: number,
    leftY: number,
    rightX: number,
    rightY: number,
  ): ArrowBuilder;
  public withPoints(
    tipOrX: Point2 | number,
    tipYOrLeft: Point2 | number,
    leftXOrRight?: Point2 | number,
    leftY?: number,
    rightX?: number,
    rightY?: number,
  ): ArrowBuilder {
    const next = new ArrowBuilder();
    if (typeof tipOrX === "number" && typeof tipYOrLeft === "number") {
      next.tip = Object.freeze({ x: tipOrX, y: tipYOrLeft });
      next.left = Object.freeze({ x: leftXOrRight as number, y: leftY ?? 0 });
      next.right = Object.freeze({ x: rightX ?? 0, y: rightY ?? 0 });
    } else {
      next.tip = Object.freeze({ ...(tipOrX as Point2) });
      next.left = Object.freeze({ ...(tipYOrLeft as Point2) });
      next.right = Object.freeze({ ...(leftXOrRight as Point2) });
    }
    next.style = this.style;
    return next;
  }

  public withStyle(style: Readonly<SvgStyle>): ArrowBuilder {
    const next = new ArrowBuilder();
    next.tip = this.tip;
    next.left = this.left;
    next.right = this.right;
    next.style = Object.freeze({ ...style });
    return next;
  }

  public build(): SvgArrow {
    return new SvgArrow(this.tip, this.left, this.right, this.style);
  }
}
