import type { Builder } from "./builder.js";
import { SvgCurve } from "../svg/svg-curve.js";
import type { SvgStyle } from "../svg/svg-style.js";

export class CurveBuilder implements Builder<SvgCurve> {
  private pathData = "";
  private style: Readonly<SvgStyle> = Object.freeze({});
  private lineCap: "butt" | "round" | "square" = "round";
  private lineJoin: "miter" | "round" | "bevel" = "round";

  public withPathData(pathData: string): CurveBuilder {
    const next = new CurveBuilder();
    next.pathData = pathData;
    next.style = this.style;
    next.lineCap = this.lineCap;
    next.lineJoin = this.lineJoin;
    return next;
  }

  public withStyle(style: Readonly<SvgStyle>): CurveBuilder {
    const next = new CurveBuilder();
    next.pathData = this.pathData;
    next.style = Object.freeze({ ...style });
    next.lineCap = this.lineCap;
    next.lineJoin = this.lineJoin;
    return next;
  }

  public withLineCap(lineCap: "butt" | "round" | "square"): CurveBuilder {
    const next = new CurveBuilder();
    next.pathData = this.pathData;
    next.style = this.style;
    next.lineCap = lineCap;
    next.lineJoin = this.lineJoin;
    return next;
  }

  public withLineJoin(lineJoin: "miter" | "round" | "bevel"): CurveBuilder {
    const next = new CurveBuilder();
    next.pathData = this.pathData;
    next.style = this.style;
    next.lineCap = this.lineCap;
    next.lineJoin = lineJoin;
    return next;
  }

  public build(): SvgCurve {
    return new SvgCurve(this.pathData, this.style, this.lineCap, this.lineJoin);
  }
}
