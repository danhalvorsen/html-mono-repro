import { type RectSemanticPoint } from './RectSemanticPoint';

export interface IPointPlacementOperation {
  readonly kind: "PointPlacement";
  readonly source: RectSemanticPoint;
}
