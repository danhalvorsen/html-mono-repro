import { ISemanticAddress } from "./ISemanticAddress.js";
import { ISemanticEdgePoint } from "./ISemanticEdgePoint.js";
import { SemanticEdgeId, SemanticVertexId } from "./SemanticValue.js";

export interface ISemanticEdge<
  TEdgeAddress extends ISemanticAddress = ISemanticAddress,
  TPointAddress extends ISemanticAddress = ISemanticAddress
> {
  readonly id: SemanticEdgeId;
  readonly address: TEdgeAddress;
  readonly startVertexId: SemanticVertexId;
  readonly endVertexId: SemanticVertexId;
  readonly points: readonly ISemanticEdgePoint<TPointAddress>[];
}
