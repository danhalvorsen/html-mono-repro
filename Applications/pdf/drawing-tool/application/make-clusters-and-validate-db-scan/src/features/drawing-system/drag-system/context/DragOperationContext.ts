import type { IGridCell } from "../../canvas-object/contracts/CanvasObject.js";

export type DragOperationContext = Readonly<{
    activeObjectId: string | null;
    hoverCell: IGridCell | null;
}>;

export class DragOperationContextFactory {
    public static createDefault(): DragOperationContext {
        return {
            activeObjectId: null,
            hoverCell: null
        };
    }
}
