export interface IGridCell {
    readonly column: number;
    readonly row: number;
}

export interface ICanvasObject {
    readonly id: string;
    readonly kind: string;
    readonly cell: IGridCell;
}
