 
import type { IEdge, IGraph, IGraphNode } from '@monorepo/core-graph';
 
import { CoreGraphAdjacencyIndex } from './CoreGraphAdjacencyIndex.js';
import { Guard } from './Guard.js';
import type { ICoreGraphAdjacencyIndex } from './ICoreGraphAdjacencyIndex.js';
import type { ICoreGraphAdjacencyIndexFactory } from './ICoreGraphAdjacencyIndexFactory.js';
import type { IEdgeCostStrategy } from './IEdgeCostStrategy.js';
import type{ INodeIdentitySelector } from './INodeIdentitySelector.js';
import type{ IPathNeighbor } from './IPathNeighbor.js';
import{ PathNeighbor } from './PathNeighbor.js';

export class CoreGraphAdjacencyIndexFactory implements ICoreGraphAdjacencyIndexFactory {
    private readonly costStrategy: IEdgeCostStrategy<string>;
    private readonly nodeIdentitySelector: INodeIdentitySelector<IGraphNode>;

    public constructor(
        costStrategy: IEdgeCostStrategy<string>,
        nodeIdentitySelector: INodeIdentitySelector<IGraphNode>
    ) {
        this.costStrategy = Guard.againstNullOrUndefined(costStrategy, "costStrategy");
        this.nodeIdentitySelector = Guard.againstNullOrUndefined(
            nodeIdentitySelector,
            "nodeIdentitySelector"
        );
    }

    public create(graph: IGraph): ICoreGraphAdjacencyIndex {
        Guard.againstNullOrUndefined(graph, "graph");

        const nodesById = new Map<string, IGraphNode>();
        const mutableNeighborsByNodeId = new Map<string, IPathNeighbor<string>[]>();

        for (const node of graph.nodes) {
            const nodeId = this.nodeIdentitySelector.selectId(node);

            if (nodesById.has(nodeId)) {
                throw new Error(`Duplicate node id '${nodeId}' detected.`);
            }

            nodesById.set(nodeId, node);
            mutableNeighborsByNodeId.set(nodeId, []);
        }

        for (const edge of graph.edges) {
            this.ensureEdgeNodesExist(nodesById, edge);

            const sourceNodeId = this.nodeIdentitySelector.selectId(edge.source);
            const targetNodeId = this.nodeIdentitySelector.selectId(edge.target);
            const stepCost = this.costStrategy.getCost(sourceNodeId, targetNodeId);

            mutableNeighborsByNodeId.get(sourceNodeId)!.push(
                new PathNeighbor<string>(targetNodeId, stepCost)
            );
        }

        const readonlyNeighborsByNodeId = new Map<string, readonly IPathNeighbor<string>[]>();

        for (const entry of mutableNeighborsByNodeId.entries()) {
            readonlyNeighborsByNodeId.set(entry[0], Object.freeze([...entry[1]]));
        }

        return new CoreGraphAdjacencyIndex(nodesById, readonlyNeighborsByNodeId);
    }

    private ensureEdgeNodesExist(
        nodesById: ReadonlyMap<string, IGraphNode>,
        edge: IEdge
    ): void {
        Guard.againstNullOrUndefined(edge, "edge");
        Guard.againstNullOrUndefined(edge.source, "edge.source");
        Guard.againstNullOrUndefined(edge.target, "edge.target");

        const sourceNodeId = this.nodeIdentitySelector.selectId(edge.source);
        const targetNodeId = this.nodeIdentitySelector.selectId(edge.target);

        if (!nodesById.has(sourceNodeId)) {
            throw new Error(`Edge source '${sourceNodeId}' is not registered in graph.nodes.`);
        }

        if (!nodesById.has(targetNodeId)) {
            throw new Error(`Edge target '${targetNodeId}' is not registered in graph.nodes.`);
        }
    }
}
