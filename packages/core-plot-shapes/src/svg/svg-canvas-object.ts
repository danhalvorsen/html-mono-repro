import { type Rectangle2 } from "@monorepo/core-math";
import { type TemplateResult } from "lit";

import type { IShape } from "./ishape.js";
import { SvgRectangle } from "./svg-rectangle.js";
import { getStyleCornerRadius, type SvgStyle } from "./svg-style.js";

export type SvgCanvasCorners = "round" | "straight";

export class SvgCanvasObject implements IShape<SvgCanvasObject> {
  public readonly bounds: Rectangle2;
  public readonly border: SvgRectangle;
  public readonly style: Readonly<SvgStyle>;
  public readonly corners: SvgCanvasCorners;
  public readonly cornerRadius: number;

  public constructor(
    bounds: Rectangle2,
    style: Readonly<SvgStyle>,
    corners: SvgCanvasCorners = "round",
    cornerRadius = 20,
  ) {
    this.bounds = Object.freeze({ ...bounds });
    this.style = Object.freeze({ ...style });
    this.corners = corners;
    this.cornerRadius = corners === "round"
      ? getStyleCornerRadius(this.style, cornerRadius)
      : 0;
    this.border = new SvgRectangle(this.bounds, this.cornerRadius, this.style);
  }

  public getStyle(): Readonly<SvgStyle> {
    return this.style;
  }

  public withStyle(style: Readonly<SvgStyle>): SvgCanvasObject {
    return new SvgCanvasObject(this.bounds, style, this.corners, this.cornerRadius);
  }

  public withStylePatch(style: Readonly<Partial<SvgStyle>>): SvgCanvasObject {
    return this.withStyle(Object.freeze({ ...this.style, ...style }));
  }

  public render(): TemplateResult {
    return this.border.render();
  }
}
