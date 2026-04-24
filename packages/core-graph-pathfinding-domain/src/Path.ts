import {   DomainGuard } from "./DomainGuard.js";
import { type IPath } from "./IPath.js";

export class Path<TNodeId> implements IPath<TNodeId> {
    private readonly nodesInternal: readonly TNodeId[];
    public readonly totalCost: number;

    public constructor(nodes: readonly TNodeId[], totalCost: number) {
        DomainGuard.againstEmptyArray(nodes, "nodes");
        this.totalCost = DomainGuard.againstInvalidNumber(totalCost, "totalCost");
        DomainGuard.againstNegative(this.totalCost, "totalCost");

        this.nodesInternal = Object.freeze([...nodes]);
        Object.freeze(this);
    }

    public get nodes(): readonly TNodeId[] {
        return this.nodesInternal;
    }
}
