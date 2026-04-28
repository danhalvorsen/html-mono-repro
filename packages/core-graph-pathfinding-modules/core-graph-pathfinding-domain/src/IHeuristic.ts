
export interface IHeuristic<TNodeId> {
    estimate(currentNodeId: TNodeId, goalNodeId: TNodeId): number;
}
