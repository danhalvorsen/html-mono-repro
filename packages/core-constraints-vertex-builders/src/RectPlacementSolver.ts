import type { IRectGeometryService } from "./IRectGeometryService.js";
import type { IRectState } from "./IRectState.js";
import type { IRectPlacementSolver } from "./IRectPlacementSolver.js";
import { RectTransform2D } from "./RectTransform2D.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";

export class RectPlacementSolver implements IRectPlacementSolver {
  public constructor(private readonly geometryService: IRectGeometryService) {}

  public solve(source: IRectState, target: IRectState, semanticPoint: RectSemanticPoint): RectTransform2D {
    const targetPoint = this.geometryService.getWorldSemanticPoint(source, semanticPoint);
    const sourcePoint = this.geometryService.getOppositeWorldSemanticPoint(target, semanticPoint);

    return new RectTransform2D(
      targetPoint.x - sourcePoint.x,
      targetPoint.y - sourcePoint.y,
      0,
    );
  }
}
