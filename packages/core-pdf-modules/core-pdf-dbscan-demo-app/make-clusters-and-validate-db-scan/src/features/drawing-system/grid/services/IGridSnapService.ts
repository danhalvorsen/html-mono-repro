import type { IGridCell } from "../../canvas-object/contracts/CanvasObject.js";

export interface IGridSnapRequest {
    readonly clientX: number;
    readonly clientY: number;
    readonly stageLeft: number;
    readonly stageTop: number;
    readonly stageWidth: number;
    readonly stageHeight: number;
    readonly canvasWidth: number;
    readonly canvasHeight: number;
    readonly cellWidth: number;
    readonly cellHeight: number;
    readonly columns: number;
    readonly rows: number;
}

export interface IGridSnapService {
    trySnap(request: IGridSnapRequest): IGridCell | null;
}
