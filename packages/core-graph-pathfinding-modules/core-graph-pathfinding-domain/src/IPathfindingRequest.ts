
export interface IPathfindingRequest<TNodeId> {
    readonly startNodeId: TNodeId;
    readonly goalNodeId: TNodeId;
}
