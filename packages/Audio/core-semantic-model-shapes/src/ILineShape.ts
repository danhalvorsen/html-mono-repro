// src/ILineShape.ts
import type { IShape } from "./IShape.js";
import { SemanticShapeKinds } from "./kinds.js";

export interface ILineShape extends IShape {
  readonly kind: typeof SemanticShapeKinds.Line;
}