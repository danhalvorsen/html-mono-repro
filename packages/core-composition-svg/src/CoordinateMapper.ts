import { IPoint } from "./IPoint";
import { PointMapper } from "./PointMapper";

export type CartesianPoint = IPoint;
export type SvgPoint = IPoint;

/**
 * Converts between a Cartesian coordinate system (origin at center, +Y up)
 * and SVG coordinates (origin top-left, +Y down).
 */
export class CoordinateMapper implements PointMapper {
  constructor(
    public readonly viewWidth: number,
    public readonly viewHeight: number,
    public readonly scale: number
  ) {}

  toSvgPoint(pt: CartesianPoint): SvgPoint {
    return {
      x: this.viewWidth / 2 + pt.x * this.scale,
      y: this.viewHeight / 2 - pt.y * this.scale,
    };
  }

  toCartesianPoint(pt: SvgPoint): CartesianPoint {
    return {
      x: (pt.x - this.viewWidth / 2) / this.scale,
      y: (this.viewHeight / 2 - pt.y) / this.scale,
    };
  }
}
