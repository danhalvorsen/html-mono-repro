import { DomainGuard } from "./DomainGuard.js";
import { type IPathCostCalculator } from "./IPathCostCalculator.js";
import { type IReadOnlyPathGraph } from "./IReadOnlyPathGraph.js";

export class PathCostCalculator<TNodeId> implements IPathCostCalculator<TNodeId> {
    public calculateTotalCost(
        graph: IReadOnlyPathGraph<TNodeId>,
        nodes: readonly TNodeId[]
    ): number {
        DomainGuard.againstNullOrUndefined(graph, "graph");
        DomainGuard.againstEmptyArray(nodes, "nodes");

        if (nodes.length === 1) {
            return 0;
        }

        let totalCost = 0;

        for (let index = 0; index < nodes.length - 1; index += 1) {
            const currentNodeId = nodes[index]!;
            const nextNodeId = nodes[index + 1]!;
            const edge = graph.getNeighbors(currentNodeId).find((neighbor) => neighbor.nodeId === nextNodeId);

            if (edge === undefined) {
                throw new Error("The supplied path contains a transition that does not exist in the graph.");
            }

            totalCost += edge.stepCost;
        }

        return totalCost;
    }
}
