
/* =================================================================================================
   Value objects
   ================================================================================================= */

import { DomainGuard } from "./DomainGuard.js";
import { type IPathNeighbor } from "./IPathNeighbor.js";

export class PathNeighbor<TNodeId> implements IPathNeighbor<TNodeId> {
    public readonly nodeId: TNodeId;
    public readonly stepCost: number;

    public constructor(nodeId: TNodeId, stepCost: number) {
        this.nodeId = DomainGuard.againstNullOrUndefined(nodeId, "nodeId");
        this.stepCost = DomainGuard.againstInvalidNumber(stepCost, "stepCost");
        DomainGuard.againstNegative(this.stepCost, "stepCost");

        Object.freeze(this);
    }
}
