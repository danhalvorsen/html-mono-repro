import { IPoint2D } from "./IPoint2D.js";

// -----------------------------------------------------------------------------
// Algorithms
// -----------------------------------------------------------------------------

export interface IEdgePointSubdivisionAlgorithm {
  createPoints(start: IPoint2D, end: IPoint2D): readonly IPoint2D[];
}
