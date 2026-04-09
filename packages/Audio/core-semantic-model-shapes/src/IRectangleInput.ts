// src/IRectangleInput.ts
import type {
  ISemanticProperty,
  ISemanticRelation,
  SemanticShapeId,
} from "@monorepo/core-semantic-model";

export interface IRectangleInput {
  readonly id: SemanticShapeId;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly properties?: readonly ISemanticProperty[];
  readonly relations?: readonly ISemanticRelation[];
}