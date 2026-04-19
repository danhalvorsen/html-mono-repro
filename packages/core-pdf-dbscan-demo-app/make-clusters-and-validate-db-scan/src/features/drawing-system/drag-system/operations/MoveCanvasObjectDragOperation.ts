import type { IDragOperation } from "../contracts/IDragOperation.js";
import type { DragOperationInput } from "../context/DragOperationInput.js";
import type { DragOperationOutput } from "../outputs/DragOperationOutput.js";
import type { DragOperationContext } from "../context/DragOperationContext.js";
import { DragOperationContextFactory } from "../context/DragOperationContext.js";
import { BeginDragTask } from "../tasks/BeginDragTask.js";
import { UpdateDragHoverTask } from "../tasks/UpdateDragHoverTask.js";
import { CommitDragTask } from "../tasks/CommitDragTask.js";
import { CancelDragTask } from "../tasks/CancelDragTask.js";

export class MoveCanvasObjectDragOperation implements IDragOperation<DragOperationInput, DragOperationOutput> {
    private readonly beginDragTask: BeginDragTask;
    private readonly updateDragHoverTask: UpdateDragHoverTask;
    private readonly commitDragTask: CommitDragTask;
    private readonly cancelDragTask: CancelDragTask;
    private context: DragOperationContext;

    public constructor() {
        this.beginDragTask = new BeginDragTask();
        this.updateDragHoverTask = new UpdateDragHoverTask();
        this.commitDragTask = new CommitDragTask();
        this.cancelDragTask = new CancelDragTask();
        this.context = DragOperationContextFactory.createDefault();
    }

    public getContext(): DragOperationContext {
        return this.context;
    }

    public async dispatch(input: DragOperationInput): Promise<readonly DragOperationOutput[]> {
        switch (input.type) {
            case "drag-start":
                return this.executeBeginDrag(input);

            case "drag-move":
                return this.executeDragMove(input);

            case "drag-end":
                return this.executeDragEnd(input);

            case "drag-cancel":
                return this.executeCancel(input);

            default:
                return [];
        }
    }

    private async executeBeginDrag(input: Extract<DragOperationInput, { type: "drag-start" }>): Promise<readonly DragOperationOutput[]> {
        if (!this.beginDragTask.canHandle(input, this.context)) {
            return [];
        }

        const result = await this.beginDragTask.execute(input, this.context);
        this.context = result.context;
        return result.outputs;
    }

    private async executeDragMove(input: Extract<DragOperationInput, { type: "drag-move" }>): Promise<readonly DragOperationOutput[]> {
        if (!this.updateDragHoverTask.canHandle(input, this.context)) {
            return [];
        }

        const result = await this.updateDragHoverTask.execute(input, this.context);
        this.context = result.context;
        return result.outputs;
    }

    private async executeDragEnd(input: Extract<DragOperationInput, { type: "drag-end" }>): Promise<readonly DragOperationOutput[]> {
        if (!this.commitDragTask.canHandle(input, this.context)) {
            return [];
        }

        const result = await this.commitDragTask.execute(input, this.context);
        this.context = result.context;
        return result.outputs;
    }

    private async executeCancel(input: Extract<DragOperationInput, { type: "drag-cancel" }>): Promise<readonly DragOperationOutput[]> {
        if (!this.cancelDragTask.canHandle(input, this.context)) {
            return [];
        }

        const result = await this.cancelDragTask.execute(input, this.context);
        this.context = result.context;
        return result.outputs;
    }
}
