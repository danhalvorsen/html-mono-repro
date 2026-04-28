import type {
    IHeuristic,
    IPathCostCalculator,
    IPathReconstructionService,
    IPathfindingRequestValidator
} from "@monorepo/core-graph-pathfinding-domain";
import {
    PathCostCalculator,
    PathReconstructionService,
    ZeroHeuristic
} from "@monorepo/core-graph-pathfinding-domain";
import { PathfindingRequestValidator } from "./PathfindingRequestValidator.js";
 
export class PathfindingDomainComposition {
    public createRequestValidator<TNodeId>(): IPathfindingRequestValidator<TNodeId> {
        return new PathfindingRequestValidator<TNodeId>();
    }

    public createPathReconstructionService<TNodeId>(): IPathReconstructionService<TNodeId> {
        return new PathReconstructionService<TNodeId>();
    }

    public createPathCostCalculator<TNodeId>(): IPathCostCalculator<TNodeId> {
        return new PathCostCalculator<TNodeId>();
    }

    public createZeroHeuristic<TNodeId>(): IHeuristic<TNodeId> {
        return new ZeroHeuristic<TNodeId>();
    }
}
