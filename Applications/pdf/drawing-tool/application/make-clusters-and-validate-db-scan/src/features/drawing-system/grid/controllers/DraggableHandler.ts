import { LitElement, type ReactiveController } from "lit";
import type { IDrawingSystemServices } from "../../composition/DrawingSystemServices.js";
import type { IGridCell } from "../../canvas-object/contracts/CanvasObject.js";

type LogLevel = "debug" | "info" | "warn";

interface ILogger {
    log(level: LogLevel, message: string, data?: unknown): void;
}

class ConsoleLogger implements ILogger {
    private readonly enabled: boolean;

    public constructor(enabled: boolean) {
        this.enabled = enabled;
    }

    public log(level: LogLevel, message: string, data?: unknown): void {
        if (!this.enabled) {
            return;
        }

        const prefix = `[DraggableHandler] ${message}`;

        switch (level) {
            case "debug":
                console.debug(prefix, data);
                break;
            case "info":
                console.info(prefix, data);
                break;
            case "warn":
                console.warn(prefix, data);
                break;
        }
    }
}

type CanvasHost = LitElement & HTMLElement & {
    width: number;
    height: number;
    cellWidth: number;
    cellHeight: number;
    columns: number;
    rows: number;
};

export class DraggableHandler implements ReactiveController {
    private readonly host: CanvasHost;
    private readonly services: IDrawingSystemServices;
    private readonly logger: ILogger;

    private activeObjectId: string | null = null;
    private hoverCell: IGridCell | null = null;
    private listening = false;

    public constructor(
        host: CanvasHost,
        services: IDrawingSystemServices,
        enableLogging: boolean = true
    ) {
        this.host = host;
        this.services = services;
        this.logger = new ConsoleLogger(enableLogging);

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

        this.onPointerDown(event);
    };

    private readonly handlePointerMoveEvent: EventListener = (event: Event): void => {
        if (!(event instanceof PointerEvent)) {
            return;
        }

        this.onPointerMove(event);
    };

    private readonly handlePointerUpEvent: EventListener = (event: Event): void => {
        if (!(event instanceof PointerEvent)) {
            return;
        }

        this.onPointerUp(event);
    };

    private onPointerDown(event: PointerEvent): void {
        const element = this.findDraggableElement(event);

        if (element === null) {
            return;
        }

        const id = element.getAttribute("data-object-id");
        if (id === null || id.trim().length === 0) {
            this.logger.log("warn", "pointerdown ignored: missing data-object-id");
            return;
        }

        this.activeObjectId = id;
        this.logger.log("info", "drag start", { id });
        event.preventDefault();
    }

    private onPointerMove(event: PointerEvent): void {
        if (this.activeObjectId === null) {
            return;
        }

        this.hoverCell = this.tryResolveCell(event.clientX, event.clientY);

        this.logger.log("debug", "drag move", {
            id: this.activeObjectId,
            hoverCell: this.hoverCell
        });

        this.host.requestUpdate();
    }

    private onPointerUp(_event: PointerEvent): void {
        if (this.activeObjectId === null) {
            return;
        }

        this.logger.log("info", "drag end", {
            id: this.activeObjectId,
            hoverCell: this.hoverCell
        });

        if (this.hoverCell !== null) {
            this.services.drawingObjectStore.updateCell(this.activeObjectId, this.hoverCell);

            this.logger.log("info", "object moved", {
                id: this.activeObjectId,
                cell: this.hoverCell
            });
        }

        this.activeObjectId = null;
        this.hoverCell = null;
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

        const result = this.services.gridSnapService.trySnap({
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

        this.logger.log("debug", "resolve cell", {
            clientX,
            clientY,
            result
        });

        return result;
    }
}
