import { Guard } from './Guard.js';
import type { IPathNeighbor } from './IPathNeighbor.js';

/* =================================================================================================
   Immutable value objects
   ================================================================================================= */

export class PathNeighbor<TNodeId> implements IPathNeighbor<TNodeId> {
    public readonly nodeId: TNodeId;
    public readonly stepCost: number;

    public constructor(nodeId: TNodeId, stepCost: number) {
        this.nodeId = Guard.againstNullOrUndefined(nodeId, "nodeId");
        this.stepCost = Guard.againstInvalidNumber(stepCost, "stepCost");
        Guard.againstNegative(this.stepCost, "stepCost");

        Object.freeze(this);
    }
}
