import { IDraggable } from "./IDraggable";

export interface IDraggableIdentity {
    getId(target: IDraggable): string;
}
