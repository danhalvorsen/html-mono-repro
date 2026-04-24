 
import type {
    IPathfindingRequestValidator,
    IPathReconstructionService,
    IPathCostCalculator,
    IHeuristic
} from "@monorepo/core-graph-pathfinding-domain";

export interface IPathfindingDomainComposition {
    createRequestValidator<TNodeId>(): IPathfindingRequestValidator<TNodeId>;
    createPathReconstructionService<TNodeId>(): IPathReconstructionService<TNodeId>;
    createPathCostCalculator<TNodeId>(): IPathCostCalculator<TNodeId>;
    createZeroHeuristic<TNodeId>(): IHeuristic<TNodeId>;
}
