import type { IDrawingSystemServices } from "./DrawingSystemServices.js";
import { CanvasObjectBuilder } from "../canvas-object/builders/CanvasObjectBuilder.js";
import { CanvasObjectFactory } from "../canvas-object/factories/CanvasObjectFactory.js";
import { IncrementingCanvasObjectIdGenerator } from "../canvas-object/value-objects/IncrementingCanvasObjectIdGenerator.js";
import { InMemoryDrawingObjectStore } from "../canvas-object/stores/InMemoryDrawingObjectStore.js";
import { GridSnapService } from "../grid/services/GridSnapService.js";
import { MenuShapeDragPayloadCodec } from "../drag-drop/codecs/DragPayloadCodec.js";
import { ApiRectangleCellsSaveWriter } from "../save/ApiRectangleCellsSaveWriter.js";
import { RectangleCellsSaveAction } from "../save/RectangleCellsSaveAction.js";

export function createDrawingSystemServices(): IDrawingSystemServices {
    const drawingObjectStore = new InMemoryDrawingObjectStore();

    return {
        canvasObjectFactory: new CanvasObjectFactory(
            new IncrementingCanvasObjectIdGenerator(),
            () => new CanvasObjectBuilder()
        ),
        drawingObjectStore,
        gridSnapService: new GridSnapService(),
        dragPayloadCodec: new MenuShapeDragPayloadCodec(),
        rectangleCellsSaveAction: new RectangleCellsSaveAction(
            drawingObjectStore,
            new ApiRectangleCellsSaveWriter()
        )
    };
}
