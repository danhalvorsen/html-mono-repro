import { IPointerMoveEvent } from "./IPointerMoveEvent.js";
import { IPointerEvent } from "./IPointerEvent.js";


export interface IPointerInput {
  onPointerDown(handler: (e: IPointerEvent) => void): () => void;
  onPointerMove(handler: (e: IPointerMoveEvent) => void): () => void;
  onPointerUp(handler: (e: IPointerEvent) => void): () => void;
}
