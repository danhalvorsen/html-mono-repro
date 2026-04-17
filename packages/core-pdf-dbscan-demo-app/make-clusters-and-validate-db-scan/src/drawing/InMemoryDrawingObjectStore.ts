import type { IDrawingObjectStore } from "./IDrawingObjectStore.js";
import type { ICanvasObject, IGridCell } from "./CanvasObject.js";

export class InMemoryDrawingObjectStore implements IDrawingObjectStore {
    private values: ReadonlyArray<ICanvasObject>;

    public constructor(seed: ReadonlyArray<ICanvasObject> = []) {
        this.values = [...seed];
    }

    public getAll(): ReadonlyArray<ICanvasObject> {
        return this.values;
    }

    public add(value: ICanvasObject): void {
        this.values = [...this.values, value];
    }

    public updateCell(id: string, cell: IGridCell): void {
        if (id.trim().length === 0) {
            throw new Error("id must not be empty.");
        }

        this.values = this.values.map((value) =>
            value.id === id
                ? {
                    ...value,
                    cell: {
                        column: cell.column,
                        row: cell.row
                    }
                }
                : value
        );
    }
}
