import { PathCostCalculator, PathReconstructionService, ZeroHeuristic } from "@monorepo/core-graph-pathfinding-domain";
export class PathfindingDomainComposition {
    createRequestValidator() {
        return new PathfindingRequestValidator();
    }
    createPathReconstructionService() {
        return new PathReconstructionService();
    }
    createPathCostCalculator() {
        return new PathCostCalculator();
    }
    createZeroHeuristic() {
        return new ZeroHeuristic();
    }
}
//# sourceMappingURL=PathfindingDomainComposition.js.map