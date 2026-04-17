import type { IDrawingSystemServices } from "./DrawingSystemServices.js";
import { CanvasObjectBuilder } from "./CanvasObjectBuilder.js";
import { CanvasObjectFactory } from "./CanvasObjectFactory.js";
import { GridSnapService } from "./GridSnapService.js";
import { InMemoryDrawingObjectStore } from "./InMemoryDrawingObjectStore.js";
import { IncrementingCanvasObjectIdGenerator } from "./IncrementingCanvasObjectIdGenerator.js";
import { MenuShapeDragPayloadCodec } from "./DragPayloadCodec.js";

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
