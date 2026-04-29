import type { IGraphNode } from '@monorepo/core-graph';
import { Guard } from './Guard.js';
import type { ICoreGraphAdjacencyIndex } from './ICoreGraphAdjacencyIndex.js';
import type { IPathNeighbor } from './IPathNeighbor.js';

/* =================================================================================================
   Adjacency index
   ================================================================================================= */
export class CoreGraphAdjacencyIndex implements ICoreGraphAdjacencyIndex {
    private readonly nodesById: ReadonlyMap<string, IGraphNode>;
    private readonly neighborsByNodeId: ReadonlyMap<string, readonly IPathNeighbor<string>[]>;

    public constructor(
        nodesById: ReadonlyMap<string, IGraphNode>,
        neighborsByNodeId: ReadonlyMap<string, readonly IPathNeighbor<string>[]>
    ) {
        this.nodesById = Guard.againstNullOrUndefined(nodesById, "nodesById");
        this.neighborsByNodeId = Guard.againstNullOrUndefined(neighborsByNodeId, "neighborsByNodeId");
        Object.freeze(this);
    }

    public contains(nodeId: string): boolean {
        Guard.againstNullOrWhiteSpace(nodeId, "nodeId");
        return this.nodesById.has(nodeId);
    }

    public getNeighbors(nodeId: string): readonly IPathNeighbor<string>[] {
        Guard.againstNullOrWhiteSpace(nodeId, "nodeId");
        return this.neighborsByNodeId.get(nodeId) ?? Object.freeze([] as IPathNeighbor<string>[]);
    }
}
