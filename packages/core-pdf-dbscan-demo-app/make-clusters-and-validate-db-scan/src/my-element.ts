import "./features/drawing-system/canvas-object/contracts/CanvasObject.js";
import "./features/drawing-system/canvas-object/contracts/ICanvasObjectIdGenerator.js";
import "./features/drawing-system/canvas-object/builders/ICanvasObjectBuilder.js";
import "./features/drawing-system/canvas-object/builders/CanvasObjectBuilder.js";
import "./features/drawing-system/canvas-object/factories/ICanvasObjectFactory.js";
import "./features/drawing-system/canvas-object/factories/CanvasObjectFactory.js";
import "./features/drawing-system/canvas-object/stores/IDrawingObjectStore.js";
import "./features/drawing-system/canvas-object/stores/InMemoryDrawingObjectStore.js";
import "./features/drawing-system/canvas-object/value-objects/CanvasObjectKind.js";
import "./features/drawing-system/canvas-object/value-objects/IncrementingCanvasObjectIdGenerator.js";

import "./features/drawing-system/grid/services/IGridSnapService.js";
import "./features/drawing-system/grid/services/GridSnapService.js";
import "./features/drawing-system/drag-system/contracts/ICell.js";
import "./features/drawing-system/drag-system/contracts/IDragOperation.js";
import "./features/drawing-system/drag-system/contracts/IDragTask.js";
import "./features/drawing-system/drag-system/contracts/ILogger.js";
import "./features/drawing-system/drag-system/contracts/ConsoleLogger.js";
import "./features/drawing-system/drag-system/context/DragOperationContext.js";
import "./features/drawing-system/drag-system/context/DragOperationInput.js";
import "./features/drawing-system/drag-system/outputs/DragOperationOutput.js";
import "./features/drawing-system/drag-system/tasks/BeginDragTask.js";
import "./features/drawing-system/drag-system/tasks/UpdateDragHoverTask.js";
import "./features/drawing-system/drag-system/tasks/CommitDragTask.js";
import "./features/drawing-system/drag-system/tasks/CancelDragTask.js";
import "./features/drawing-system/drag-system/operations/MoveCanvasObjectDragOperation.js";
import "./features/drawing-system/drag-system/controllers/DragSystemReactiveController.js";

import "./features/drawing-system/drag-drop/contracts/IDragPayloadCodec.js";
import "./features/drawing-system/drag-drop/codecs/DragPayloadCodec.js";

import "./features/drawing-system/menu/MenuShapeCatalog.js";

import "./features/drawing-system/composition/DrawingSystemServices.js";
import "./features/drawing-system/composition/createDrawingSystemServices.js";

import "./features/drawing-system/canvas/MyMenu.js";
import "./features/drawing-system/canvas/MyCanvas.js";
import "./features/drawing-system/canvas/MyDrawingSystem.js";

