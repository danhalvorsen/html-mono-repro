import { IPathfindingDomainComposition } from "./IPathfindingDomainComposition.js";
import {  IHeuristic, IPathCostCalculator, IPathReconstructionService, PathCostCalculator, PathReconstructionService, ZeroHeuristic}  
from "@monorepo/core-graph-pathfinding-domain";
 
export class PathfindingDomainComposition implements IPathfindingDomainComposition {
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
