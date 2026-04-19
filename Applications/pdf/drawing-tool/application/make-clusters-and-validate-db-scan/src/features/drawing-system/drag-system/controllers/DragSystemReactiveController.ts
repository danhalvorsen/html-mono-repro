import { LitElement, type ReactiveController } from "../../../../../node_modules/lit/development/index.js";
import type { IDrawingSystemServices } from "../../composition/DrawingSystemServices.js";
import type { IGridCell } from "../../canvas-object/contracts/CanvasObject.js";
import type { ILogger } from "../contracts/ILogger.js";
import { ConsoleLogger } from "../contracts/ConsoleLogger.js";
import { MoveCanvasObjectDragOperation } from "../operations/MoveCanvasObjectDragOperation.js";
import type { DragOperationOutput } from "../outputs/DragOperationOutput.js";

type CanvasHost = LitElement & HTMLElement & {
    width: number;
    height: number;
    cellWidth: number;
    cellHeight: number;
    columns: number;
    rows: number;
};

export class DragSystemReactiveController implements ReactiveController {
    private readonly host: CanvasHost;
    private readonly services: IDrawingSystemServices;
    private readonly logger: ILogger;
    private readonly moveOperation: MoveCanvasObjectDragOperation;

    private listening = false;
    private hoverCell: IGridCell | null = null;

    public constructor(
        host: CanvasHost,
        services: IDrawingSystemServices,
        enableLogging: boolean = true
    ) {
        this.host = host;
        this.services = services;
        this.logger = new ConsoleLogger(enableLogging);
        this.moveOperation = new MoveCanvasObjectDragOperation();

        this.host.addController(this);
    }

    public hostConnected(): void {
        this.attach();
    }

    public hostDisconnected(): void {
        this.detach();
    }

    public getHoverCell(): IGridCell | null {
        return this.hoverCell;
    }

    private attach(): void {
        if (this.listening) {
            return;
        }

        this.logger.log("info", "connected");

        this.host.renderRoot.addEventListener("pointerdown", this.handlePointerDownEvent);
        window.addEventListener("pointermove", this.handlePointerMoveEvent);
        window.addEventListener("pointerup", this.handlePointerUpEvent);

        this.listening = true;
    }

    private detach(): void {
        if (!this.listening) {
            return;
        }

        this.logger.log("info", "disconnected");

        this.host.renderRoot.removeEventListener("pointerdown", this.handlePointerDownEvent);
        window.removeEventListener("pointermove", this.handlePointerMoveEvent);
        window.removeEventListener("pointerup", this.handlePointerUpEvent);

        this.listening = false;
    }

    private readonly handlePointerDownEvent: EventListener = (event: Event): void => {
        if (!(event instanceof PointerEvent)) {
            return;
        }

        void this.onPointerDown(event);
    };

    private readonly handlePointerMoveEvent: EventListener = (event: Event): void => {
        if (!(event instanceof PointerEvent)) {
            return;
        }

        void this.onPointerMove(event);
    };

    private readonly handlePointerUpEvent: EventListener = (event: Event): void => {
        if (!(event instanceof PointerEvent)) {
            return;
        }

        void this.onPointerUp(event);
    };

    private async onPointerDown(event: PointerEvent): Promise<void> {
        const element = this.findDraggableElement(event);
        if (element === null) {
            return;
        }

        const objectId = element.getAttribute("data-object-id");
        if (objectId === null || objectId.trim().length === 0) {
            this.logger.log("warn", "pointerdown ignored: missing data-object-id");
            return;
        }

        const outputs = await this.moveOperation.dispatch({
            type: "drag-start",
            payload: {
                objectId
            }
        });

        this.handleOutputs(outputs);
        event.preventDefault();
    }

    private async onPointerMove(event: PointerEvent): Promise<void> {
        const hoverCell = this.tryResolveCell(event.clientX, event.clientY);

        const outputs = await this.moveOperation.dispatch({
            type: "drag-move",
            payload: {
                hoverCell
            }
        });

        this.handleOutputs(outputs);
    }

    private async onPointerUp(event: PointerEvent): Promise<void> {
        const hoverCell = this.tryResolveCell(event.clientX, event.clientY);

        const outputs = await this.moveOperation.dispatch({
            type: "drag-end",
            payload: {
                hoverCell
            }
        });

        this.handleOutputs(outputs);
    }

    private handleOutputs(outputs: readonly DragOperationOutput[]): void {
        for (const output of outputs) {
            switch (output.kind) {
                case "drag-started":
                    this.logger.log("info", "drag started", output);
                    break;

                case "drag-hover-changed":
                    this.hoverCell = output.hoverCell;
                    this.logger.log("debug", "drag hover changed", output);
                    break;

                case "drag-committed":
                    this.services.drawingObjectStore.updateCell(output.objectId, output.targetCell);
                    this.hoverCell = null;
                    this.logger.log("info", "drag committed", output);
                    break;

                case "drag-cancelled":
                    this.hoverCell = null;
                    this.logger.log("info", "drag cancelled", output);
                    break;
            }
        }

        this.host.requestUpdate();
    }

    private findDraggableElement(event: PointerEvent): Element | null {
        const path = event.composedPath();

        for (const value of path) {
            if (!(value instanceof Element)) {
                continue;
            }

            if (value.hasAttribute("data-object-id")) {
                return value;
            }
        }

        return null;
    }

    private tryResolveCell(clientX: number, clientY: number): IGridCell | null {
        const stage = this.host.renderRoot.querySelector(".stage");

        if (!(stage instanceof SVGSVGElement)) {
            this.logger.log("warn", "stage not found");
            return null;
        }

        const rect = stage.getBoundingClientRect();

        return this.services.gridSnapService.trySnap({
            clientX,
            clientY,
            stageLeft: rect.left,
            stageTop: rect.top,
            stageWidth: rect.width,
            stageHeight: rect.height,
            canvasWidth: this.host.width,
            canvasHeight: this.host.height,
            cellWidth: this.host.cellWidth,
            cellHeight: this.host.cellHeight,
            columns: this.host.columns,
            rows: this.host.rows
        });
    }
}
