/* ========array.forEach(element => {
    import { IPathReconstructionService, IPathCostCalculator, IHeuristic } from "@monorepro/core-graph-pathfinding-domain";
    import { IPathfindingRequestValidator } from "@monorepro/core-graph-pathfinding-domain-validators";
    
});========================================================================================
   core-graph-pathfinding
   Depends on: core-graph
   Notes:
   - No import statements by request.
   - Assumes the following types come from "core-graph":
       IGraph
       IGraphNode
       IEdge
   - This package is the pathfinding contract + adapter layer over core-graph.
   - Concrete algorithms (BFS, Dijkstra, A*) should live in separate modules.
   ================================================================================================= */
/* =================================================================================================
   Shared guards
   ================================================================================================= */
export class Guard {
    public static againstNullOrUndefined<T>(value: T | null | undefined, name: string): T {
        if (value === null || value === undefined) {
            throw new Error(`${name} cannot be null or undefined.`);
        }

        return value;
    }

    public static againstNullOrWhiteSpace(value: string, name: string): string {
        if (value.trim().length === 0) {
            throw new Error(`${name} cannot be empty or whitespace.`);
        }

        return value;
    }

    public static againstNegative(value: number, name: string): number {
        if (value < 0) {
            throw new Error(`${name} cannot be negative.`);
        }

        return value;
    }

    public static againstInvalidNumber(value: number, name: string): number {
        if (!Number.isFinite(value)) {
            throw new Error(`${name} must be a finite number.`);
        }

        return value;
    }

    public static againstFalse(condition: boolean, message: string): void {
        if (!condition) {
            throw new Error(message);
        }
    }
}
