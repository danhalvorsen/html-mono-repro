import type { ICanvasObject, IGridCell } from "../canvas-object/contracts/CanvasObject.js";
import { CanvasObjectKinds } from "../canvas-object/value-objects/CanvasObjectKind.js";

export interface IRectangleCellSaveRecord {
    readonly id: string;
    readonly kind: typeof CanvasObjectKinds.rectangle;
    readonly cell: IGridCell;
}

export interface IRectangleCellsSaveFile {
    readonly rectangles: ReadonlyArray<IRectangleCellSaveRecord>;
}

export function createRectangleCellsSaveFile(
    objects: ReadonlyArray<ICanvasObject>
): IRectangleCellsSaveFile {
    return {
        rectangles: objects
            .filter((value) => value.kind === CanvasObjectKinds.rectangle)
            .map((value): IRectangleCellSaveRecord => ({
                id: value.id,
                kind: CanvasObjectKinds.rectangle,
                cell: {
                    column: value.cell.column,
                    row: value.cell.row
                }
            }))
    };
}
