import { Guard } from './Guard.js';
import type { IEdgeCostStrategy } from './IEdgeCostStrategy.js';

export class DictionaryEdgeCostStrategy implements IEdgeCostStrategy<string> {
    private readonly costsByAssociationKey: ReadonlyMap<string, number>;

    public constructor(costsByAssociationKey: ReadonlyMap<string, number>) {
        this.costsByAssociationKey = Guard.againstNullOrUndefined(
            costsByAssociationKey,
            "costsByAssociationKey"
        );
    }

    public getCost(sourceNodeId: string, targetNodeId: string): number {
        Guard.againstNullOrWhiteSpace(sourceNodeId, "sourceNodeId");
        Guard.againstNullOrWhiteSpace(targetNodeId, "targetNodeId");

        const key = DictionaryEdgeCostStrategy.createKey(sourceNodeId, targetNodeId);
        const cost = this.costsByAssociationKey.get(key);

        if (cost === undefined) {
            throw new Error(`Missing edge cost for '${sourceNodeId}' -> '${targetNodeId}'.`);
        }

        Guard.againstInvalidNumber(cost, "cost");
        Guard.againstNegative(cost, "cost");

        return cost;
    }

    public static createKey(sourceNodeId: string, targetNodeId: string): string {
        return `${sourceNodeId}=>${targetNodeId}`;
    }
}
