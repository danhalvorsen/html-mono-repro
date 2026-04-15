import type { Builder } from "./builder.js";
import { SvgCircle } from "../svg/svg-circle.js";
import type { SvgStyle } from "../svg/svg-style.js";

export class CircleBuilder implements Builder<SvgCircle> {
  private cx = 0;
  private cy = 0;
  private r = 1;
  private style: Readonly<SvgStyle> = Object.freeze({});

  public withCenter(cx: number, cy: number): CircleBuilder {
    const next = new CircleBuilder();
    next.cx = cx;
    next.cy = cy;
    next.r = this.r;
    next.style = this.style;
    return next;
  }

  public withRadius(r: number): CircleBuilder {
    const next = new CircleBuilder();
    next.cx = this.cx;
    next.cy = this.cy;
    next.r = r;
    next.style = this.style;
    return next;
  }

  public withStyle(style: Readonly<SvgStyle>): CircleBuilder {
    const next = new CircleBuilder();
    next.cx = this.cx;
    next.cy = this.cy;
    next.r = this.r;
    next.style = Object.freeze({ ...style });
    return next;
  }

  public build(): SvgCircle {
    return new SvgCircle(this.cx, this.cy, this.r, this.style);
  }
}
