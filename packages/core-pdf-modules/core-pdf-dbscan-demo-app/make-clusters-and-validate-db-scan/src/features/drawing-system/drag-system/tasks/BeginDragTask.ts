import type { IDragTask, IDragTaskResult } from "../contracts/IDragTask.js";
import type { DragOperationContext } from "../context/DragOperationContext.js";
import type { DragOperationInput } from "../context/DragOperationInput.js";
import type { DragOperationOutput } from "../outputs/DragOperationOutput.js";

type BeginDragInput = Extract<DragOperationInput, { type: "drag-start" }>;

export class BeginDragTask implements IDragTask<DragOperationContext, BeginDragInput, DragOperationOutput> {
    public canHandle(input: BeginDragInput, _context: DragOperationContext): boolean {
        return input.payload.objectId.trim().length > 0;
    }

    public async execute(
        input: BeginDragInput,
        context: DragOperationContext
    ): Promise<IDragTaskResult<DragOperationContext, DragOperationOutput>> {
        const nextContext: DragOperationContext = {
            activeObjectId: input.payload.objectId,
            hoverCell: context.hoverCell
        };

        return {
            context: nextContext,
            outputs: [
                {
                    kind: "drag-started",
                    objectId: input.payload.objectId
                }
            ]
        };
    }
}
