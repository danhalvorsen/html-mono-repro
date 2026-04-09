import { ISemanticAddress } from "./ISemanticAddress.js";
import { ISemanticProperty } from "./ISemanticProperty.js";
import { ISemanticRelation } from "./ISemanticRelation.js";
import { ISemanticShapeKind } from "./ISemanticShapeKind.js";
import { ISemanticTopology } from "./ISemanticTopology.js";
import { SemanticShapeId } from "./SemanticValue.js";

export interface ISemanticShape<
  TVertexAddress extends ISemanticAddress = ISemanticAddress,
  TEdgeAddress extends ISemanticAddress = ISemanticAddress,
  TPointAddress extends ISemanticAddress = ISemanticAddress
> {
  readonly id: SemanticShapeId;
  readonly kind: ISemanticShapeKind;
  readonly topology: ISemanticTopology<TVertexAddress, TEdgeAddress, TPointAddress>;
  readonly properties: readonly ISemanticProperty[];
  readonly relations: readonly ISemanticRelation[];
}
