
import type {
  IPoint2D,
  ISemanticProperty,
  ISemanticRelation,
  SemanticShapeId,
} from '@monorepo/core-semantic-model';

export interface ILineInput {
  readonly id: SemanticShapeId;
  readonly start: IPoint2D;
  readonly end: IPoint2D;
  readonly properties?: readonly ISemanticProperty[];
  readonly relations?: readonly ISemanticRelation[];
}