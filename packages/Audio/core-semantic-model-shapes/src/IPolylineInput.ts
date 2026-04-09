
import type {
  IPoint2D,
  ISemanticProperty,
  ISemanticRelation,
  SemanticShapeId,
} from "@monorepo/core-semantic-model";

export interface IPolylineInput {
  readonly id: SemanticShapeId;
  readonly vertices: readonly IPoint2D[];
  readonly properties?: readonly ISemanticProperty[];
  readonly relations?: readonly ISemanticRelation[];
}
