import { CartesianPoint, SvgPoint } from "./CoordinateMapper";


export interface PointMapper {
  toSvgPoint(point: CartesianPoint): SvgPoint;
  toCartesianPoint(point: SvgPoint): CartesianPoint;
}
