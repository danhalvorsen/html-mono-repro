import { IMouseDragMove } from "./IPointerTypes.js";
export interface IMouseController {
    onStart(handler: () => void): () => void;
    onMove(handler: (move: IMouseDragMove) => void): () => void;
    onEnd(handler: () => void): () => void;
    dispose(): void;
}
