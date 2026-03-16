import { Vector2 } from "@monorepo/core-math";
import { IDraggable } from "./IDraggable.js";

export interface IDragController {
    onDragStart(target: IDraggable, position: Vector2): Promise<void>;
    onDrag(target: IDraggable, position: Vector2): Promise<void>;
    onDragOver(target: IDraggable, position: Vector2): Promise<void>;
    onDrop(target: IDraggable, position: Vector2): Promise<void>;
    onCancel(target: IDraggable): Promise<void>;
}
