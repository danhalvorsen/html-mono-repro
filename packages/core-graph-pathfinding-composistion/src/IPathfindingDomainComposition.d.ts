export interface IPathfindingDomainComposition {
    createRequestValidator<TNodeId>(): IPathfindingRequestValidator<TNodeId>;
    createPathReconstructionService<TNodeId>(): IPathReconstructionService<TNodeId>;
    createPathCostCalculator<TNodeId>(): IPathCostCalculator<TNodeId>;
    createZeroHeuristic<TNodeId>(): IHeuristic<TNodeId>;
}
//# sourceMappingURL=IPathfindingDomainComposition.d.ts.map