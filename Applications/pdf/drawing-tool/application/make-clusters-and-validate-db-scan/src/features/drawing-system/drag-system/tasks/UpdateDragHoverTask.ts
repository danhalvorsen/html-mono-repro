import type { IDragTask, IDragTaskResult } from "../contracts/IDragTask.js";
import type { DragOperationContext } from "../context/DragOperationContext.js";
import type { DragOperationInput } from "../context/DragOperationInput.js";
import type { DragOperationOutput } from "../outputs/DragOperationOutput.js";

type DragMoveInput = Extract<DragOperationInput, { type: "drag-move" }>;

export class UpdateDragHoverTask implements IDragTask<DragOperationContext, DragMoveInput, DragOperationOutput> {
    public canHandle(_input: DragMoveInput, context: DragOperationContext): boolean {
        return context.activeObjectId !== null;
    }

    public async execute(
        input: DragMoveInput,
        context: DragOperationContext
    ): Promise<IDragTaskResult<DragOperationContext, DragOperationOutput>> {
        const nextContext: DragOperationContext = {
            activeObjectId: context.activeObjectId,
            hoverCell: input.payload.hoverCell
        };

        const outputs: DragOperationOutput[] = [];
        if (context.activeObjectId !== null) {
            outputs.push({
                kind: "drag-hover-changed",
                objectId: context.activeObjectId,
                hoverCell: input.payload.hoverCell
            });
        }

        return {
            context: nextContext,
            outputs
        };
    }
}
