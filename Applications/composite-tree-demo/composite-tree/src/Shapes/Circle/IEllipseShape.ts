import type { Point } from "@monorepo/core-math";
import type { IShape } from "../../Shape/IShape";

export interface IEllipseShape extends IShape {
  readonly kind: "ellipse";
  readonly center: Point;
  readonly radiusX: number;
  readonly radiusY: number;
}
