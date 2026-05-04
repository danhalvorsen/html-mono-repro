import type { ICanvasObject } from "../contracts/CanvasObject.js";
import type { CanvasObjectKind } from "../value-objects/CanvasObjectKind.js";

export interface ICanvasObjectFactory {
    createAtCell(kind: CanvasObjectKind, column: number, row: number): ICanvasObject;
}
