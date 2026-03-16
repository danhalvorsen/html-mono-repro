import { DragOperation } from "../../Dragging/DragOperation";

export interface IOnDragMessagePayload {
    readonly operation: DragOperation;
    readonly targetId: string;
    readonly x: number;
    readonly y: number;
}
