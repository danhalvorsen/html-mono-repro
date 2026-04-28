import { Guard } from './Guard.js';
import type { IPathCostCalculator } from './IPathCostCalculator.js';
import type { IReadOnlyPathGraph } from './IReadOnlyPathGraph.js';

export class PathCostCalculator<TNodeId> implements IPathCostCalculator<TNodeId> {
    public calculateTotalCost(
        graph: IReadOnlyPathGraph<TNodeId>,
        nodes: readonly TNodeId[]
    ): number {
        Guard.againstNullOrUndefined(graph, "graph");
        Guard.againstNullOrUndefined(nodes, "nodes");

        if (nodes.length <= 1) {
            return 0;
        }

        let totalCost = 0;

        for (let index = 0; index < nodes.length - 1; index += 1) {
            const source = nodes[index]!;
            const target = nodes[index + 1]!;
            const neighbor = graph.getNeighbors(source).find((item) => item.nodeId === target);

            if (neighbor === undefined) {
                throw new Error("Path contains a step that does not exist in the graph.");
            }

            totalCost += neighbor.stepCost;
        }

        return totalCost;
    }
}
