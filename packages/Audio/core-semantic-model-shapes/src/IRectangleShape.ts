// src/IRectangleShape.ts
import type { IShape } from "./IShape.js";
import { SemanticShapeKinds } from "./kinds.js";

export interface IRectangleShape extends IShape {
  readonly kind: typeof SemanticShapeKinds.Rectangle;
}