import type { Builder } from "./builder.js";
import type { Point2 } from "@monorepo/core-math";
import { SvgLine } from "../svg/svg-line.js";
import type { SvgStyle } from "../svg/svg-style.js";

export class LineBuilder implements Builder<SvgLine> {
  private start: Point2 = Object.freeze({ x: 0, y: 0 });
  private end: Point2 = Object.freeze({ x: 0, y: 0 });
  private style: Readonly<SvgStyle> = Object.freeze({});

  public withPoints(start: Point2, end: Point2): LineBuilder;
  public withPoints(x1: number, y1: number, x2: number, y2: number): LineBuilder;
  public withPoints(
    startOrX1: Point2 | number,
    endOrY1: Point2 | number,
    x2?: number,
    y2?: number,
  ): LineBuilder {
    const next = new LineBuilder();
    if (typeof startOrX1 === "number" && typeof endOrY1 === "number") {
      next.start = Object.freeze({ x: startOrX1, y: endOrY1 });
      next.end = Object.freeze({ x: x2 ?? 0, y: y2 ?? 0 });
    } else {
      next.start = Object.freeze({ ...(startOrX1 as Point2) });
      next.end = Object.freeze({ ...(endOrY1 as Point2) });
    }
    next.style = this.style;
    return next;
  }

  public withStyle(style: Readonly<SvgStyle>): LineBuilder {
    const next = new LineBuilder();
    next.start = this.start;
    next.end = this.end;
    next.style = Object.freeze({ ...style });
    return next;
  }

  public build(): SvgLine {
    return new SvgLine(this.start, this.end, this.style);
  }
}
