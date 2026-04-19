import type { IDrawingSystemServices } from "./DrawingSystemServices.js";
import { CanvasObjectBuilder } from "../canvas-object/builders/CanvasObjectBuilder.js";
import { CanvasObjectFactory } from "../canvas-object/factories/CanvasObjectFactory.js";
import { IncrementingCanvasObjectIdGenerator } from "../canvas-object/value-objects/IncrementingCanvasObjectIdGenerator.js";
import { InMemoryDrawingObjectStore } from "../canvas-object/stores/InMemoryDrawingObjectStore.js";
import { GridSnapService } from "../grid/services/GridSnapService.js";
import { MenuShapeDragPayloadCodec } from "../drag-drop/codecs/DragPayloadCodec.js";

export function createDrawingSystemServices(): IDrawingSystemServices {
    return {
        canvasObjectFactory: new CanvasObjectFactory(
            new IncrementingCanvasObjectIdGenerator(),
            () => new CanvasObjectBuilder()
        ),
        drawingObjectStore: new InMemoryDrawingObjectStore(),
        gridSnapService: new GridSnapService(),
        dragPayloadCodec: new MenuShapeDragPayloadCodec()
    };
}
