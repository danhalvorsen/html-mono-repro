import type { CanvasObjectKind } from "./CanvasObjectKind.js";

export interface IGridCell {
    readonly column: number;
    readonly row: number;
}

export interface ICanvasObject {
    readonly id: string;
    readonly kind: CanvasObjectKind;
    readonly cell: IGridCell;
}
