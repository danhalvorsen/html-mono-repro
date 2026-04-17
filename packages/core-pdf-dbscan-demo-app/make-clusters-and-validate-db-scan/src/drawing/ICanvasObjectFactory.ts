import type { CanvasObjectKind } from "./CanvasObjectKind.js";
import type { ICanvasObject } from "./CanvasObject.js";

export interface ICanvasObjectFactory {
    createAtCell(kind: CanvasObjectKind, column: number, row: number): ICanvasObject;
}
