import type { Vector2 } from "@monorepo/core-math";
import type { Polygon } from "./Polygon.js";
import type { PolygonCollisionDetails } from "./PolygonCollisionDetails.js";

export enum CollisionReferenceKind {
  None = "none",
  Point = "point",
  Segment = "segment",
}

export enum PolygonCollisionKind {
  None = "none",
  SegmentIntersection = "segment-intersection",
  SourcePointInsideTarget = "source-point-inside-target",
  TargetPointInsideSource = "target-point-inside-source",
}

export interface CollisionReference {
  readonly index: number | null;
  readonly position: Vector2 | null;
  readonly kind: CollisionReferenceKind;
}

export interface PolygonCollisionResult {
  readonly hasCollide: boolean;
  readonly kind: PolygonCollisionKind;
  readonly details: PolygonCollisionDetails;
}

export interface PolygonCollisionQuery {
  readonly source: Polygon;
  readonly target: Polygon;
  readonly tolerance?: number;
}
