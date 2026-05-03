import type { IDragTask, IDragTaskResult } from "../contracts/IDragTask.js";
import type { DragOperationContext } from "../context/DragOperationContext.js";
import type { DragOperationInput } from "../context/DragOperationInput.js";
import type { DragOperationOutput } from "../outputs/DragOperationOutput.js";
import { DragOperationContextFactory } from "../context/DragOperationContext.js";

type DragCancelInput = Extract<DragOperationInput, { type: "drag-cancel" }>;

export class CancelDragTask implements IDragTask<DragOperationContext, DragCancelInput, DragOperationOutput> {
    public canHandle(_input: DragCancelInput, context: DragOperationContext): boolean {
        return context.activeObjectId !== null;
    }

    public async execute(
        _input: DragCancelInput,
        context: DragOperationContext
    ): Promise<IDragTaskResult<DragOperationContext, DragOperationOutput>> {
        if (context.activeObjectId === null) {
            return {
                context,
                outputs: []
            };
        }

        return {
            context: DragOperationContextFactory.createDefault(),
            outputs: [
                {
                    kind: "drag-cancelled",
                    objectId: context.activeObjectId
                }
            ]
        };
    }
}
