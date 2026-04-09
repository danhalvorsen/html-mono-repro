// IEllipseInput.ts
import type {
  IPoint2D,
  ISemanticProperty,
  ISemanticRelation,
  SemanticShapeId,
} from "@monorepo/core-semantic-model";

export interface IEllipseInput {
  readonly id: SemanticShapeId;
  readonly center: IPoint2D;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly properties?: readonly ISemanticProperty[];
  readonly relations?: readonly ISemanticRelation[];
}