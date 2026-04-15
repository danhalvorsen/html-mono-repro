import type { Rectangle2 } from "@monorepo/core-math";

import type { Builder } from "./builder.js";
import { SvgCanvasObject, type SvgCanvasCorners } from "../svg/svg-canvas-object.js";
import type { SvgStyle } from "../svg/svg-style.js";

export class CanvasObjectBuilder implements Builder<SvgCanvasObject> {
  private bounds: Rectangle2 = Object.freeze({ x: 0, y: 0, width: 0, height: 0 });
  private style: Readonly<SvgStyle> = Object.freeze({});
  private corners: SvgCanvasCorners = "round";
  private cornerRadius = 20;

  public withBounds(bounds: Rectangle2): CanvasObjectBuilder {
    const next = new CanvasObjectBuilder();
    next.bounds = Object.freeze({ ...bounds });
    next.style = this.style;
    next.corners = this.corners;
    next.cornerRadius = this.cornerRadius;
    return next;
  }

  public withStyle(style: Readonly<SvgStyle>): CanvasObjectBuilder {
    const next = new CanvasObjectBuilder();
    next.bounds = this.bounds;
    next.style = Object.freeze({ ...style });
    next.corners = this.corners;
    next.cornerRadius = this.cornerRadius;
    return next;
  }

  public withCorners(corners: SvgCanvasCorners): CanvasObjectBuilder {
    const next = new CanvasObjectBuilder();
    next.bounds = this.bounds;
    next.style = this.style;
    next.corners = corners;
    next.cornerRadius = this.cornerRadius;
    return next;
  }

  public withCornerRadius(cornerRadius: number): CanvasObjectBuilder {
    const next = new CanvasObjectBuilder();
    next.bounds = this.bounds;
    next.style = this.style;
    next.corners = this.corners;
    next.cornerRadius = cornerRadius;
    return next;
  }

  public build(): SvgCanvasObject {
    return new SvgCanvasObject(this.bounds, this.style, this.corners, this.cornerRadius);
  }
}
