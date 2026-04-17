import type { ICanvasObject, IGridCell } from "./CanvasObject.js";

export interface IDrawingObjectStore {
    getAll(): ReadonlyArray<ICanvasObject>;
    add(value: ICanvasObject): void;
    updateCell(id: string, cell: IGridCell): void;
}
