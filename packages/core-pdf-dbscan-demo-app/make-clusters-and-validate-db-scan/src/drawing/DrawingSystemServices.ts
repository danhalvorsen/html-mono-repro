import type { ICanvasObjectFactory } from "./ICanvasObjectFactory.js";
import type { IDrawingObjectStore } from "./IDrawingObjectStore.js";
import type { IGridSnapService } from "./IGridSnapService.js";
import type { IDragPayloadCodec, IMenuShapeDragPayload } from "./DragPayloadCodec.js";

export interface IDrawingSystemServices {
    readonly canvasObjectFactory: ICanvasObjectFactory;
    readonly drawingObjectStore: IDrawingObjectStore;
    readonly gridSnapService: IGridSnapService;
    readonly dragPayloadCodec: IDragPayloadCodec<IMenuShapeDragPayload>;
}
