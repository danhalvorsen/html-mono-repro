import type { IRectSize } from "./IRectSize.js";
import type { IRectState } from "./IRectState.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";

export interface IPoint3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface IRectGeometryService {
  getLocalSemanticPoint(size: IRectSize, point: RectSemanticPoint): IPoint3;
  getWorldSemanticPoint(rect: IRectState, point: RectSemanticPoint): IPoint3;
  getOppositeWorldSemanticPoint(rect: IRectState, point: RectSemanticPoint): IPoint3;
}
