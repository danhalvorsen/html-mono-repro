import type { ICanvasObject, IGridCell } from "../canvas-object/contracts/CanvasObject.js";
import { CanvasObjectKinds } from "../canvas-object/value-objects/CanvasObjectKind.js";
import { createDrawingTextLabel } from "../text/createDrawingTextLabel.js";

export interface IRectangleCellSaveRecord {
    readonly id: string;
    readonly kind: typeof CanvasObjectKinds.rectangle | typeof CanvasObjectKinds.text;
    readonly cell: IGridCell;
    readonly text?: string;
}

export interface IRectangleCellsSaveFile {
    readonly rectangles: ReadonlyArray<IRectangleCellSaveRecord>;
}

export function createRectangleCellsSaveFile(
    objects: ReadonlyArray<ICanvasObject>
): IRectangleCellsSaveFile {
    return {
        rectangles: objects
            .filter((value) =>
                value.kind === CanvasObjectKinds.rectangle ||
                value.kind === CanvasObjectKinds.text
            )
            .map((value): IRectangleCellSaveRecord => ({
                id: value.id,
                kind: value.kind === CanvasObjectKinds.text
                    ? CanvasObjectKinds.text
                    : CanvasObjectKinds.rectangle,
                cell: {
                    column: value.cell.column,
                    row: value.cell.row
                },
                text: value.kind === CanvasObjectKinds.text
                    ? createDrawingTextLabel(value.id)
                    : undefined
            }))
    };
}
