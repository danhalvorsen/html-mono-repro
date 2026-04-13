// src/IEllipseShape.ts
import type { IShape } from "./IShape.js";
import { SemanticShapeKinds } from "./kinds.js";

export interface IEllipseShape extends IShape {
  readonly kind: typeof SemanticShapeKinds.Ellipse;
}