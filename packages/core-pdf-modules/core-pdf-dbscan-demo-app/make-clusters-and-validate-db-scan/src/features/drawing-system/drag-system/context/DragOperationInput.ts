import type { IGridCell } from "../../canvas-object/contracts/CanvasObject.js";

export type DragOperationInput =
    | Readonly<{
        type: "drag-start";
        payload: {
            objectId: string;
        };
    }>
    | Readonly<{
        type: "drag-move";
        payload: {
            hoverCell: IGridCell | null;
        };
    }>
    | Readonly<{
        type: "drag-end";
        payload: {
            hoverCell: IGridCell | null;
        };
    }>
    | Readonly<{
        type: "drag-cancel";
        payload: {};
    }>;
