export interface IEdgeCostStrategy<TNodeId> {
    getCost(sourceNodeId: TNodeId, targetNodeId: TNodeId): number;
}
