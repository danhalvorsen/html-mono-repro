import { svg, type TemplateResult } from "lit";

import type { IShape } from "./ishape.js";
import { SvgCircle } from "./svg-circle.js";
import { SvgLabel } from "./svg-label.js";
import type { SvgStyle } from "./svg-style.js";

export class SvgCoordinatePoint implements IShape<SvgCoordinatePoint> {
  public readonly circle: SvgCircle;
  public readonly label: SvgLabel;
  public readonly labelVisible: boolean;
  public readonly style: Readonly<SvgStyle>;

  public constructor(
    circle: SvgCircle,
    label: SvgLabel,
    labelVisible = true,
  ) {
    this.circle = circle;
    this.label = label;
    this.labelVisible = labelVisible;
    this.style = Object.freeze({
      ...circle.getStyle(),
      ...label.getStyle(),
      visible: labelVisible,
    });
  }

  public getStyle(): Readonly<SvgStyle> {
    return this.style;
  }

  public withStyle(style: Readonly<SvgStyle>): SvgCoordinatePoint {
    return new SvgCoordinatePoint(
      this.circle.withStyle(style),
      this.label.withStyle(style),
      style.visible ?? this.labelVisible,
    );
  }

  public withStylePatch(style: Readonly<Partial<SvgStyle>>): SvgCoordinatePoint {
    return this.withStyle(Object.freeze({ ...this.style, ...style }));
  }

  public render(): TemplateResult {
    return svg`
      <g>
        ${this.circle.render()}
        ${this.labelVisible ? this.label.render() : svg``}
      </g>
    `;
  }
}
