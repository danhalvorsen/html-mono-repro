// src/IPolylineShape.ts
import type { IShape } from "./IShape.js";
import { SemanticShapeKinds } from "./kinds.js";

export interface IPolylineShape extends IShape {
  readonly kind: typeof SemanticShapeKinds.Polyline;
}