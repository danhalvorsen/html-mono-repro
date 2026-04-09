// packages/Audio/core-semantic-model-shapes/src/IShapeDefinition.ts
import type {
  ISemanticProperty,
  ISemanticRelation,
  ISemanticShapeKind,
  SemanticShapeId,
} from "@monorepo/core-semantic-model";

import type { ShapeTopology } from "./types.js";

export interface IShapeDefinition {
  readonly id: SemanticShapeId;
  readonly kind: ISemanticShapeKind;
  readonly topology: ShapeTopology;
  readonly properties?: readonly ISemanticProperty[];
  readonly relations?: readonly ISemanticRelation[];
}