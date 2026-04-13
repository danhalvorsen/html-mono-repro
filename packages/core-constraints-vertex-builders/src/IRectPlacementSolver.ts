import type { IRectState } from "./IRectState.js";
import type { IRectTransform2D } from "./IRectTransform2D.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";

export interface IRectPlacementSolver {
  solve(source: IRectState, target: IRectState, semanticPoint: RectSemanticPoint): IRectTransform2D;
}
