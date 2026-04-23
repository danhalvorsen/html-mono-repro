import { type IPath } from "./IPath.js";

export interface IPathfindingResult<TNodeId> {
  readonly found: boolean;
  readonly path: IPath<TNodeId> | null;
}
