import type { ICanvasObject } from "./CanvasObject.js";
import type { CanvasObjectKind } from "./CanvasObjectKind.js";

export interface ICanvasObjectBuilder {
    withId(id: string): ICanvasObjectBuilder;
    withKind(kind: CanvasObjectKind): ICanvasObjectBuilder;
    atCell(column: number, row: number): ICanvasObjectBuilder;
    reset(): void;
    build(): ICanvasObject;
}
