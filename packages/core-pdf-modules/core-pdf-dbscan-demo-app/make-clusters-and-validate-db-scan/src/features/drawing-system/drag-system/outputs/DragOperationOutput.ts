import type { IGridCell } from "../../canvas-object/contracts/CanvasObject.js";

export type DragOperationOutput =
    | Readonly<{
        kind: "drag-started";
        objectId: string;
    }>
    | Readonly<{
        kind: "drag-hover-changed";
        objectId: string;
        hoverCell: IGridCell | null;
    }>
    | Readonly<{
        kind: "drag-committed";
        objectId: string;
        targetCell: IGridCell;
    }>
    | Readonly<{
        kind: "drag-cancelled";
        objectId: string;
    }>;
