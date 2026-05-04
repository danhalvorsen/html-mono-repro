import type { IDragTask, IDragTaskResult } from "../contracts/IDragTask.js";
import type { DragOperationContext } from "../context/DragOperationContext.js";
import type { DragOperationInput } from "../context/DragOperationInput.js";
import type { DragOperationOutput } from "../outputs/DragOperationOutput.js";
import { DragOperationContextFactory } from "../context/DragOperationContext.js";

type DragEndInput = Extract<DragOperationInput, { type: "drag-end" }>;

export class CommitDragTask implements IDragTask<DragOperationContext, DragEndInput, DragOperationOutput> {
    public canHandle(_input: DragEndInput, context: DragOperationContext): boolean {
        return context.activeObjectId !== null;
    }

    public async execute(
        input: DragEndInput,
        context: DragOperationContext
    ): Promise<IDragTaskResult<DragOperationContext, DragOperationOutput>> {
        if (context.activeObjectId === null) {
            return {
                context,
                outputs: []
            };
        }

        if (input.payload.hoverCell === null) {
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

        return {
            context: DragOperationContextFactory.createDefault(),
            outputs: [
                {
                    kind: "drag-committed",
                    objectId: context.activeObjectId,
                    targetCell: input.payload.hoverCell
                }
            ]
        };
    }
}
