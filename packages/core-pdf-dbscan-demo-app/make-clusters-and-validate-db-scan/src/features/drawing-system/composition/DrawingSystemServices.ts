import type { ICanvasObjectFactory } from "../canvas-object/factories/ICanvasObjectFactory.js";
import type { IDrawingObjectStore } from "../canvas-object/stores/IDrawingObjectStore.js";
import type { IGridSnapService } from "../grid/services/IGridSnapService.js";
import type { IDragPayloadCodec } from "../drag-drop/contracts/IDragPayloadCodec.js";
import type { IMenuShapeDragPayload } from "../drag-drop/codecs/DragPayloadCodec.js";
import type { RectangleCellsSaveAction } from "../save/RectangleCellsSaveAction.js";

export interface IDrawingSystemServices {
    readonly canvasObjectFactory: ICanvasObjectFactory;
    readonly drawingObjectStore: IDrawingObjectStore;
    readonly gridSnapService: IGridSnapService;
    readonly dragPayloadCodec: IDragPayloadCodec<IMenuShapeDragPayload>;
    readonly rectangleCellsSaveAction: RectangleCellsSaveAction;
}
