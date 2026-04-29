 
import type { IGraph } from '@monorepo/core-graph';
import{ Guard } from './Guard.js';
import type { ICoreGraphAdjacencyIndex } from './ICoreGraphAdjacencyIndex.js';
import type{ ICoreGraphAdjacencyIndexFactory } from './ICoreGraphAdjacencyIndexFactory.js';
import type  { ICoreGraphPathGraphAdapter } from './ICoreGraphPathGraphAdapter.js';
import type { IPathNeighbor } from './IPathNeighbor.js';

/* =================================================================================================
   core-graph adapter
   ================================================================================================= */
export class CoreGraphPathGraphAdapter implements ICoreGraphPathGraphAdapter {
    private readonly adjacencyIndex: ICoreGraphAdjacencyIndex;
    public readonly graph: IGraph;

    public constructor(
        graph: IGraph,
        adjacencyIndexFactory: ICoreGraphAdjacencyIndexFactory
    ) {
        this.graph = Guard.againstNullOrUndefined(graph, "graph");
        const factory = Guard.againstNullOrUndefined(adjacencyIndexFactory, "adjacencyIndexFactory");
        this.adjacencyIndex = factory.create(this.graph);

        Object.freeze(this);
    }

    public contains(nodeId: string): boolean {
        return this.adjacencyIndex.contains(nodeId);
    }

    public getNeighbors(nodeId: string): readonly IPathNeighbor<string>[] {
        return this.adjacencyIndex.getNeighbors(nodeId);
    }
}
