import { Guard } from './Guard.js';
import { type IPathfindingRequest } from './IPathfindingRequest.js';

export class PathfindingRequest<TNodeId> implements IPathfindingRequest<TNodeId> {
    public readonly startNodeId: TNodeId;
    public readonly goalNodeId: TNodeId;

    public constructor(startNodeId: TNodeId, goalNodeId: TNodeId) {
        this.startNodeId = Guard.againstNullOrUndefined(startNodeId, "startNodeId");
        this.goalNodeId = Guard.againstNullOrUndefined(goalNodeId, "goalNodeId");

        Object.freeze(this);
    }
}
