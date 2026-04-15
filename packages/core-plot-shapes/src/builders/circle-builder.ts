import type { Builder } from "./builder.js";
import type { Point2 } from "@monorepo/core-math";
import { SvgCircle } from "../svg/svg-circle.js";
import type { SvgStyle } from "../svg/svg-style.js";

export class CircleBuilder implements Builder<SvgCircle> {
  private center: Point2 = Object.freeze({ x: 0, y: 0 });
  private r = 1;
  private style: Readonly<SvgStyle> = Object.freeze({});

  public withCenter(center: Point2): CircleBuilder;
  public withCenter(cx: number, cy: number): CircleBuilder;
  public withCenter(centerOrX: Point2 | number, cy?: number): CircleBuilder {
    const next = new CircleBuilder();
    if (typeof centerOrX === "number") {
      next.center = Object.freeze({ x: centerOrX, y: cy ?? 0 });
    } else {
      next.center = Object.freeze({ ...centerOrX });
    }
    next.r = this.r;
    next.style = this.style;
    return next;
  }

  public withRadius(r: number): CircleBuilder {
    const next = new CircleBuilder();
    next.center = this.center;
    next.r = r;
    next.style = this.style;
    return next;
  }

  public withStyle(style: Readonly<SvgStyle>): CircleBuilder {
    const next = new CircleBuilder();
    next.center = this.center;
    next.r = this.r;
    next.style = Object.freeze({ ...style });
    return next;
  }

  public build(): SvgCircle {
    return new SvgCircle(this.center, this.r, this.style);
  }
}
