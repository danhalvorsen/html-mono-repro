import { BoundingBox2D } from "@monorepo/core-math";

export interface ISourceBoundaryPlacementContext {
  readonly source: BoundingBox2D;
  readonly sourceBoundary: BoundingBox2D;
  readonly target: BoundingBox2D;
}