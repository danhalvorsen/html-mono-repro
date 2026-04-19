import { DragOperationContextFactory, type DragOperationContext } from "../../../../../../src/features/drawing-system/drag-system/context/DragOperationContext.js";
import type { IGridCell } from "../../../../../../src/features/drawing-system/canvas-object/contracts/CanvasObject.js";
import type { DragOperationInput } from "../../../../../../src/features/drawing-system/drag-system/context/DragOperationInput.js";

export class DragSystemFixture {
    public createDefaultContext(): DragOperationContext {
        return DragOperationContextFactory.createDefault();
    }

    public createActiveContext(id: string = "obj-1", hover: IGridCell | null = null): DragOperationContext {
        return {
            activeObjectId: id,
            hoverCell: hover
        };
    }

    public cell(col: number = 1, row: number = 2): IGridCell {
        return { column: col, row };
    }

    public begin(id: string = "obj-1"): Extract<DragOperationInput, { type: "drag-start" }> {
        return { type: "drag-start", payload: { objectId: id } };
    }

    public move(cell: IGridCell | null): Extract<DragOperationInput, { type: "drag-move" }> {
        return { type: "drag-move", payload: { hoverCell: cell } };
    }

    public end(cell: IGridCell | null): Extract<DragOperationInput, { type: "drag-end" }> {
        return { type: "drag-end", payload: { hoverCell: cell } };
    }

    public cancel(): Extract<DragOperationInput, { type: "drag-cancel" }> {
        return { type: "drag-cancel", payload: {} };
    }
}
