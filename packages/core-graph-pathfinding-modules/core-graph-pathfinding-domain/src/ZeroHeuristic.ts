 
/* =================================================================================================
   Optional heuristic implementations
   ================================================================================================= */

import { DomainGuard } from "./DomainGuard.js";
import { type IHeuristic } from "./IHeuristic.js";

export class ZeroHeuristic<TNodeId> implements IHeuristic<TNodeId> {
    public estimate(currentNodeId: TNodeId, goalNodeId: TNodeId): number {
        DomainGuard.againstNullOrUndefined(currentNodeId, "currentNodeId");
        DomainGuard.againstNullOrUndefined(goalNodeId, "goalNodeId");
        return 0;
    }
}
