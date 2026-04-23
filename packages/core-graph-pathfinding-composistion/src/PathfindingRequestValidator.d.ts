import { IReadOnlyPathGraph } from "@monorepo/core-graph-pathfinding-domain";
export declare class PathfindingRequestValidator<TNodeId> implements IPathfindingRequestValidator<TNodeId> {
    private readonly validator;
    constructor(validator: IValidator<IPathfindingRequestValidationContext<TNodeId>>);
    validate(graph: IReadOnlyPathGraph<TNodeId>, request: IPathfindingRequest<TNodeId>): void;
}
//# sourceMappingURL=PathfindingRequestValidator.d.ts.map