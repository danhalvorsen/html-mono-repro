import { ISemanticAddress } from "./ISemanticAddress.js";
import { SemanticVertexId } from "./SemanticValue.js";
import { IPoint2D } from "./IPoint2D.js";

// -----------------------------------------------------------------------------
// Topology primitives
// -----------------------------------------------------------------------------

export interface ISemanticVertex<
    TVertexAddress extends ISemanticAddress = ISemanticAddress
> {
    readonly id: SemanticVertexId;
    readonly address: TVertexAddress;
    readonly position: IPoint2D;
}
