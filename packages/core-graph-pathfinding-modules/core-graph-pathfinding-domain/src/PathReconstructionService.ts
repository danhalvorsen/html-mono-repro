 
/* =================================================================================================
   Domain services
   ================================================================================================= */

import { DomainGuard } from "./DomainGuard.js";
import { type IPathReconstructionService } from "./IPathReconstructionService.js";

export class PathReconstructionService<TNodeId> implements IPathReconstructionService<TNodeId> {
    public reconstruct(
        cameFrom: ReadonlyMap<TNodeId, TNodeId>,
        startNodeId: TNodeId,
        goalNodeId: TNodeId
    ): readonly TNodeId[] {
        DomainGuard.againstNullOrUndefined(cameFrom, "cameFrom");
        DomainGuard.againstNullOrUndefined(startNodeId, "startNodeId");
        DomainGuard.againstNullOrUndefined(goalNodeId, "goalNodeId");

        const reversedPath: TNodeId[] = [];
        let currentNodeId: TNodeId = goalNodeId;

        reversedPath.push(currentNodeId);

        while (currentNodeId !== startNodeId) {
            const previousNodeId = cameFrom.get(currentNodeId);

            if (previousNodeId === undefined) {
                throw new Error("Cannot reconstruct path because the predecessor chain is incomplete.");
            }

            reversedPath.push(previousNodeId);
            currentNodeId = previousNodeId;
        }

        reversedPath.reverse();
        return Object.freeze(reversedPath);
    }
}
