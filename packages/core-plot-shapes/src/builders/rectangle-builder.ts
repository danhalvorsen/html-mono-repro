import type { Rectangle2 } from "@monorepo/core-math";

import type { Builder } from "./builder.js";
import { SvgRectangle } from "../svg/svg-rectangle.js";
import type { SvgStyle } from "../svg/svg-style.js";

export class RectangleBuilder implements Builder<SvgRectangle> {
  private bounds: Rectangle2 = Object.freeze({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  private rx = 0;
  private style: Readonly<SvgStyle> = Object.freeze({});

  public withBounds(x: number, y: number, width: number, height: number): RectangleBuilder {
    return this.withRectangle({
      x,
      y,
      width,
      height,
    });
  }

  public withRectangle(bounds: Rectangle2): RectangleBuilder {
    const next = new RectangleBuilder();
    next.bounds = Object.freeze({ ...bounds });
    next.rx = this.rx;
    next.style = this.style;
    return next;
  }

  public withCornerRadius(rx: number): RectangleBuilder {
    const next = new RectangleBuilder();
    next.bounds = this.bounds;
    next.rx = rx;
    next.style = this.style;
    return next;
  }

  public withStyle(style: Readonly<SvgStyle>): RectangleBuilder {
    const next = new RectangleBuilder();
    next.bounds = this.bounds;
    next.rx = this.rx;
    next.style = Object.freeze({ ...style });
    return next;
  }

  public build(): SvgRectangle {
    return new SvgRectangle(this.bounds, this.rx, this.style);
  }
}
