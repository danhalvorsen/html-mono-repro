import { Guard } from './Guard.js';
import { type IEdgeCostStrategy } from './IEdgeCostStrategy.js';

/* =================================================================================================
   Strategies
   ================================================================================================= */

export class UnitEdgeCostStrategy implements IEdgeCostStrategy<string> {
    public getCost(sourceNodeId: string, targetNodeId: string): number {
        Guard.againstNullOrWhiteSpace(sourceNodeId, "sourceNodeId");
        Guard.againstNullOrWhiteSpace(targetNodeId, "targetNodeId");
        return 1;
    }
}
