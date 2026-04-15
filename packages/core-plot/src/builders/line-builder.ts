import type { Builder } from "./builder.js";
import { SvgLine } from "../svg/svg-line.js";
import type { SvgStyle } from "../svg/svg-style.js";

export class LineBuilder implements Builder<SvgLine> {
  private x1 = 0;
  private y1 = 0;
  private x2 = 0;
  private y2 = 0;
  private style: Readonly<SvgStyle> = Object.freeze({});

  public withPoints(x1: number, y1: number, x2: number, y2: number): LineBuilder {
    const next = new LineBuilder();
    next.x1 = x1;
    next.y1 = y1;
    next.x2 = x2;
    next.y2 = y2;
    next.style = this.style;
    return next;
  }

  public withStyle(style: Readonly<SvgStyle>): LineBuilder {
    const next = new LineBuilder();
    next.x1 = this.x1;
    next.y1 = this.y1;
    next.x2 = this.x2;
    next.y2 = this.y2;
    next.style = Object.freeze({ ...style });
    return next;
  }

  public build(): SvgLine {
    return new SvgLine(this.x1, this.y1, this.x2, this.y2, this.style);
  }
}
