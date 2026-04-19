import type { ICanvasObject } from "../contracts/CanvasObject.js";

export interface ICanvasObjectBuilder {
    withId(id: string): ICanvasObjectBuilder;
    withKind(kind: string): ICanvasObjectBuilder;
    atCell(column: number, row: number): ICanvasObjectBuilder;
    reset(): void;
    build(): ICanvasObject;
}
