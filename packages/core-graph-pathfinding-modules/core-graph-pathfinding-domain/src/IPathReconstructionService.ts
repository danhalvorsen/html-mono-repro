
export interface IPathReconstructionService<TNodeId> {
    reconstruct(
        cameFrom: ReadonlyMap<TNodeId, TNodeId>,
        startNodeId: TNodeId,
        goalNodeId: TNodeId
    ): readonly TNodeId[];
}
