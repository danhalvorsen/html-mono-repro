// src/IPolygonShape.ts
import type { IShape } from "./IShape.js";
import { SemanticShapeKinds } from "./kinds.js";

export interface IPolygonShape extends IShape {
  readonly kind: typeof SemanticShapeKinds.Polygon;
}