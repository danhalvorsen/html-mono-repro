import { type IReadOnlyPathGraph } from "./IReadOnlyPathGraph.js";

export interface IPathCostCalculator<TNodeId> {
    calculateTotalCost(
        graph: IReadOnlyPathGraph<TNodeId>,
        nodes: readonly TNodeId[]
    ): number;
}
