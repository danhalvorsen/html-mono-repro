import { Guard } from './Guard.js';
import type { IPathReconstructionService } from './IPathReconstructionService.js';

/* =================================================================================================
   Services
   ================================================================================================= */

export class PathReconstructionService<TNodeId> implements IPathReconstructionService<TNodeId> {
    public reconstruct(
        cameFrom: ReadonlyMap<TNodeId, TNodeId>,
        startNodeId: TNodeId,
        goalNodeId: TNodeId
    ): readonly TNodeId[] {
        Guard.againstNullOrUndefined(cameFrom, "cameFrom");
        Guard.againstNullOrUndefined(startNodeId, "startNodeId");
        Guard.againstNullOrUndefined(goalNodeId, "goalNodeId");

        const reversed: TNodeId[] = [];
        let current: TNodeId = goalNodeId;

        reversed.push(current);

        while (current !== startNodeId) {
            const previous = cameFrom.get(current);

            if (previous === undefined) {
                throw new Error("Cannot reconstruct path because the predecessor chain is incomplete.");
            }

            reversed.push(previous);
            current = previous;
        }

        reversed.reverse();
        return Object.freeze(reversed);
    }
}
