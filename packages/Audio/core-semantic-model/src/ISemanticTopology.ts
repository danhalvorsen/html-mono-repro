import { ISemanticAddress } from "./ISemanticAddress.js";
import { ISemanticEdge } from "./ISemanticEdge.js";
import { ISemanticVertex } from "./ISemanticVertex.js";


export interface ISemanticTopology<
  TVertexAddress extends ISemanticAddress = ISemanticAddress,
  TEdgeAddress extends ISemanticAddress = ISemanticAddress,
  TPointAddress extends ISemanticAddress = ISemanticAddress
> {
  readonly vertices: readonly ISemanticVertex<TVertexAddress>[];
  readonly edges: readonly ISemanticEdge<TEdgeAddress, TPointAddress>[];
}
