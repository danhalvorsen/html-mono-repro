import type { ICanvasObjectBuilder } from "./ICanvasObjectBuilder.js";
import type { ICanvasObject } from "../contracts/CanvasObject.js";
import { CanvasObjectKinds, type CanvasObjectKind } from "../value-objects/CanvasObjectKind.js";

type CanvasObjectState = {
    id: string;
    kind: CanvasObjectKind;
    column: number;
    row: number;
};

export class CanvasObjectBuilder implements ICanvasObjectBuilder {
    private state: CanvasObjectState;

    public constructor() {
        this.state = this.createDefaultState();
    }

    public withId(id: string): ICanvasObjectBuilder {
        if (id.trim().length === 0) {
            throw new Error("id must not be empty.");
        }

        this.state.id = id;
        return this;
    }

    public withKind(kind: CanvasObjectKind): ICanvasObjectBuilder {
        this.state.kind = kind;
        return this;
    }

    public atCell(column: number, row: number): ICanvasObjectBuilder {
        if (!Number.isInteger(column) || column < 0) {
            throw new Error("column must be a non-negative integer.");
        }

        if (!Number.isInteger(row) || row < 0) {
            throw new Error("row must be a non-negative integer.");
        }

        this.state.column = column;
        this.state.row = row;
        return this;
    }

    public reset(): void {
        this.state = this.createDefaultState();
    }

    public build(): ICanvasObject {
        const value: ICanvasObject = {
            id: this.state.id,
            kind: this.state.kind,
            cell: {
                column: this.state.column,
                row: this.state.row
            }
        };

        this.reset();
        return value;
    }

    private createDefaultState(): CanvasObjectState {
        return {
            id: "",
            kind: CanvasObjectKinds.rectangle,
            column: 0,
            row: 0
        };
    }
}
