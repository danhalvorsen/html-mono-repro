import { Guard } from './Guard.js';
import type { IPath } from './IPath.js';
import type { IPathfindingResult } from './IPathfindingResult.js';
 
export class PathfindingResult<TNodeId> implements IPathfindingResult<TNodeId> {
    public readonly found: boolean;
    public readonly path: IPath<TNodeId> | null;

    private constructor(found: boolean, path: IPath<TNodeId> | null) {
        this.found = found;
        this.path = path;
        Object.freeze(this);
    }

    public static success<TNodeId>(path: IPath<TNodeId>): PathfindingResult<TNodeId> {
        Guard.againstNullOrUndefined(path, "path");
        return new PathfindingResult<TNodeId>(true, path);
    }

    public static notFound<TNodeId>(): PathfindingResult<TNodeId> {
        return new PathfindingResult<TNodeId>(false, null);
    }
}
