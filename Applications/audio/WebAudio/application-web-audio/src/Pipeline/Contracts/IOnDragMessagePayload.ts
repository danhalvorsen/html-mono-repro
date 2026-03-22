import { IDraggable } from "../..";
import { DragOperation } from "../../Dragging/DragOperation";
 
export interface IOnDragMessagePayload {
    readonly operation: DragOperation;
    readonly targetId: string;
    readonly target: IDraggable;
    readonly x: number;
    readonly y: number;
}
