import type { IPoint3 } from "./IRectGeometryService.js";

export interface IRectTransform2D {
  readonly translateX: number;
  readonly translateY: number;
  readonly rotationDegrees: number;

  apply(point: IPoint3): IPoint3;
}
