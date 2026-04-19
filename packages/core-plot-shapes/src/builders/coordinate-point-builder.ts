import type { Builder } from "./builder.js";
import { SvgCoordinatePoint } from "../svg/svg-coordinate-point.js";
import { SvgCircle } from "../svg/svg-circle.js";
import { SvgLabel } from "../svg/svg-label.js";

export class CoordinatePointBuilder implements Builder<SvgCoordinatePoint> {
  private circle: SvgCircle = new SvgCircle({ x: 0, y: 0 }, 1, Object.freeze({}));
  private label: SvgLabel = new SvgLabel(
    Object.freeze({ x: 0, y: 0 }),
    "",
    "start",
    Object.freeze({ fill: "currentColor", fontFamily: "inherit", fontSize: 12, fontWeight: 400 }),
  );
  private labelVisible = true;

  public withCircle(circle: SvgCircle): CoordinatePointBuilder {
    const next = new CoordinatePointBuilder();
    next.circle = circle;
    next.label = this.label;
    next.labelVisible = this.labelVisible;
    return next;
  }

  public withLabel(label: SvgLabel): CoordinatePointBuilder {
    const next = new CoordinatePointBuilder();
    next.circle = this.circle;
    next.label = label;
    next.labelVisible = this.labelVisible;
    return next;
  }

  public withLabelVisibility(labelVisible: boolean): CoordinatePointBuilder {
    const next = new CoordinatePointBuilder();
    next.circle = this.circle;
    next.label = this.label;
    next.labelVisible = labelVisible;
    return next;
  }

  public build(): SvgCoordinatePoint {
    return new SvgCoordinatePoint(this.circle, this.label, this.labelVisible);
  }
}
