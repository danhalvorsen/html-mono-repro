import { IDraggable } from "../../Dragging/IDraggable";
import { IDraggableIdentity } from "../../Dragging/IDraggableIdentity";

export class DefaultDraggableIdentity implements IDraggableIdentity {
    public getId(target: IDraggable): string {
        const shapeId = target.shape?.getId?.();

        if (typeof shapeId === "string" && shapeId.trim() !== "") {
            return shapeId;
        }

        const candidate = target as Partial<{ id: string; }>;

        if (typeof candidate.id === "string" && candidate.id.trim() !== "") {
            return candidate.id;
        }

        throw new Error("Unable to resolve draggable target id.");
    }
}
