import { IPathfindingDomainComposition } from "./IPathfindingDomainComposition.js";
import { IHeuristic, IPathCostCalculator, IPathReconstructionService } from "@monorepo/core-graph-pathfinding-domain";
export declare class PathfindingDomainComposition implements IPathfindingDomainComposition {
    createRequestValidator<TNodeId>(): IPathfindingRequestValidator<TNodeId>;
    createPathReconstructionService<TNodeId>(): IPathReconstructionService<TNodeId>;
    createPathCostCalculator<TNodeId>(): IPathCostCalculator<TNodeId>;
    createZeroHeuristic<TNodeId>(): IHeuristic<TNodeId>;
}
//# sourceMappingURL=PathfindingDomainComposition.d.ts.map