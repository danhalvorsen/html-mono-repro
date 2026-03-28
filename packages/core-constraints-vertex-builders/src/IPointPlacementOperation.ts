import { type RectSemanticPoint } from './RectSemanticPoint.js';

export interface IPointPlacementOperation {
  readonly kind: "PointPlacement";
  readonly source: RectSemanticPoint;
}
