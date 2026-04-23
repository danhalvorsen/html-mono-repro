import { Guard } from './Guard.js';
import { type IPath } from './IPath.js';
 
export class Path<TNodeId> implements IPath<TNodeId> {
    private readonly nodesInternal: readonly TNodeId[];
    public readonly totalCost: number;

    public constructor(nodes: readonly TNodeId[], totalCost: number) {
        Guard.againstNullOrUndefined(nodes, "nodes");
        Guard.againstFalse(nodes.length > 0, "nodes must contain at least one item.");
        this.totalCost = Guard.againstInvalidNumber(totalCost, "totalCost");
        Guard.againstNegative(this.totalCost, "totalCost");

        this.nodesInternal = Object.freeze([...nodes]);
        Object.freeze(this);
    }

    public get nodes(): readonly TNodeId[] {
        return this.nodesInternal;
    }
}
