/* =================================================================================================
   Domain contracts
   ================================================================================================= */
export interface IPathNeighbor<TNodeId> {
    readonly nodeId: TNodeId;
    readonly stepCost: number;
}
