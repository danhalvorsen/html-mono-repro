import { LitElement, css, html, svg, type TemplateResult } from "lit";
import type { ICanvasObject, IGridCell } from "../canvas-object/contracts/CanvasObject.js";
import type { IDrawingSystemServices } from "../composition/DrawingSystemServices.js";
import { CanvasObjectKinds } from "../canvas-object/value-objects/CanvasObjectKind.js";
import { MenuShapeDragPayloadCodec } from "../drag-drop/codecs/DragPayloadCodec.js";
import { DragSystemReactiveController } from "../drag-system/controllers/DragSystemReactiveController.js";
import "./MyMenu.js";

export class MyCanvas extends LitElement {
    public static override readonly properties = {
        width: { type: Number },
        height: { type: Number },
        rows: { type: Number },
        columns: { type: Number },
        cellWidth: { type: Number, attribute: "cell-width" },
        cellHeight: { type: Number, attribute: "cell-height" },
        gridStroke: { type: String, attribute: "grid-stroke" },
        gridStrokeWidth: { type: Number, attribute: "grid-stroke-width" },
        services: { attribute: false }
    };

    public width = 960;
    public height = 640;
    public rows = 10;
    public columns = 10;
    public cellWidth = 96;
    public cellHeight = 96;
    public gridStroke = "rgba(255,255,255,0.08)";
    public gridStrokeWidth = 1;
    public services: IDrawingSystemServices | null = null;

    private hoverCell: IGridCell | null = null;
    private dragController: DragSystemReactiveController | null = null;
    private isCanvasSizeInitialized = false;

    protected override firstUpdated(): void {
        this.initializeCanvas();
    }

    protected override updated(): void {
        if (!this.isCanvasSizeInitialized) {
            this.initializeCanvas();
        }

        if (this.dragController === null && this.services !== null) {
            this.dragController = new DragSystemReactiveController(this as MyCanvas, this.services, true);
        }
    }

    public override disconnectedCallback(): void {
        window.removeEventListener("resize", this.handleWindowResize);
        super.disconnectedCallback();
    }

    protected override render(): TemplateResult {
        return html`
            <section class="layout">
                <aside class="menu-column">
                    <my-menu
                        .cellWidth=${this.cellWidth}
                        .cellHeight=${this.cellHeight}
                        .dragPayloadCodec=${this.resolveDragPayloadCodec()}>
                    </my-menu>
                </aside>

                <section class="canvas-column">
                    <div
                        class="drop-surface"
                        @dragover=${this.handleDragOver}
                        @dragleave=${this.handleDragLeave}
                        @drop=${this.handleDrop}>

                        <svg
                            class="stage"
                            width="${this.width}"
                            height="${this.height}"
                            viewBox="0 0 ${this.width} ${this.height}"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="none">

                            <rect
                                x="0"
                                y="0"
                                width="${this.width}"
                                height="${this.height}"
                                fill="#0f172a">
                            </rect>

                            ${this.renderGrid()}
                            ${this.renderHoverCell()}
                            ${this.renderDragHover()}
                            ${this.renderObjects()}
                        </svg>
                    </div>
                </section>
            </section>
        `;
    }

    private initializeCanvas(): void {
        if (this.isCanvasSizeInitialized) {
            return;
        }

        this.updateCanvasSize();
        window.addEventListener("resize", this.handleWindowResize);
        this.isCanvasSizeInitialized = true;
    }

    private readonly handleWindowResize = (): void => {
        this.updateCanvasSize();
    };

    private updateCanvasSize(): void {
        const menuWidthRatio = 0.20;
        const minimumMenuWidth = 220;
        const maximumMenuWidth = 360;

        const viewportWidth = Math.max(window.innerWidth, 320);
        const viewportHeight = Math.max(window.innerHeight, 320);

        const menuWidth = Math.min(
            Math.max(viewportWidth * menuWidthRatio, minimumMenuWidth),
            maximumMenuWidth
        );

        const canvasWidth = Math.max(viewportWidth - menuWidth, this.cellWidth);
        const canvasHeight = Math.max(viewportHeight, this.cellHeight);

        const nextColumns = Math.max(1, Math.floor(canvasWidth / this.cellWidth));
        const nextRows = Math.max(1, Math.floor(canvasHeight / this.cellHeight));

        if (
            this.width === canvasWidth &&
            this.height === canvasHeight &&
            this.columns === nextColumns &&
            this.rows === nextRows
        ) {
            return;
        }

        this.width = canvasWidth;
        this.height = canvasHeight;
        this.columns = nextColumns;
        this.rows = nextRows;
    }

    private resolveDragPayloadCodec(): MenuShapeDragPayloadCodec {
        if (this.services === null) {
            return new MenuShapeDragPayloadCodec();
        }

        return this.services.dragPayloadCodec as MenuShapeDragPayloadCodec;
    }

    private renderGrid(): TemplateResult {
        const width = this.columns * this.cellWidth;
        const height = this.rows * this.cellHeight;

        const horizontalLines = Array.from({ length: this.rows + 1 }, (_, index) => {
            const y = index * this.cellHeight;
            return svg`
                <line
                    x1="0"
                    y1="${y}"
                    x2="${width}"
                    y2="${y}"
                    stroke="${this.gridStroke}"
                    stroke-width="${this.gridStrokeWidth}">
                </line>
            `;
        });

        const verticalLines = Array.from({ length: this.columns + 1 }, (_, index) => {
            const x = index * this.cellWidth;
            return svg`
                <line
                    x1="${x}"
                    y1="0"
                    x2="${x}"
                    y2="${height}"
                    stroke="${this.gridStroke}"
                    stroke-width="${this.gridStrokeWidth}">
                </line>
            `;
        });

        return svg`
            <g data-role="grid-matrix">
                ${horizontalLines}
                ${verticalLines}
            </g>
        `;
    }

    private renderHoverCell(): TemplateResult {
        if (this.hoverCell === null) {
            return svg``;
        }

        return svg`
            <rect
                x="${this.hoverCell.column * this.cellWidth}"
                y="${this.hoverCell.row * this.cellHeight}"
                width="${this.cellWidth}"
                height="${this.cellHeight}"
                fill="rgba(96, 165, 250, 0.18)"
                stroke="rgba(96, 165, 250, 0.85)"
                stroke-width="2">
            </rect>
        `;
    }

    private renderDragHover(): TemplateResult {
        if (this.dragController === null) {
            return svg``;
        }

        const cell = this.dragController.getHoverCell();
        if (cell === null) {
            return svg``;
        }

        return svg`
            <rect
                x="${cell.column * this.cellWidth}"
                y="${cell.row * this.cellHeight}"
                width="${this.cellWidth}"
                height="${this.cellHeight}"
                fill="rgba(250, 204, 21, 0.18)"
                stroke="rgba(250, 204, 21, 0.85)"
                stroke-width="2">
            </rect>
        `;
    }

    private renderObjects(): ReadonlyArray<TemplateResult> {
        if (this.services === null) {
            return [];
        }

        return this.services.drawingObjectStore
            .getAll()
            .map((value) => this.renderObject(value));
    }

    private renderObject(value: ICanvasObject): TemplateResult {
        const x = value.cell.column * this.cellWidth;
        const y = value.cell.row * this.cellHeight;

        switch (value.kind) {
            case CanvasObjectKinds.rectangle:
                return svg`
                    <rect
                        data-object-id="${value.id}"
                        x="${x + 8}"
                        y="${y + 8}"
                        width="${this.cellWidth - 16}"
                        height="${this.cellHeight - 16}"
                        fill="#4caf50"
                        stroke="#1f1f1f"
                        stroke-width="2"
                        style="cursor: grab; pointer-events: auto;">
                    </rect>
                `;

            case CanvasObjectKinds.circle:
                return svg`
                    <circle
                        data-object-id="${value.id}"
                        cx="${x + (this.cellWidth / 2)}"
                        cy="${y + (this.cellHeight / 2)}"
                        r="${Math.min(this.cellWidth, this.cellHeight) / 2 - 8}"
                        fill="#2196f3"
                        stroke="#1f1f1f"
                        stroke-width="2"
                        style="cursor: grab; pointer-events: auto;">
                    </circle>
                `;

            case CanvasObjectKinds.triangle:
                return svg`
                    <polygon
                        data-object-id="${value.id}"
                        points="
                            ${x + (this.cellWidth / 2)},${y + 10}
                            ${x + this.cellWidth - 10},${y + this.cellHeight - 10}
                            ${x + 10},${y + this.cellHeight - 10}
                        "
                        fill="#f59e0b"
                        stroke="#1f1f1f"
                        stroke-width="2"
                        style="cursor: grab; pointer-events: auto;">
                    </polygon>
                `;

            case CanvasObjectKinds.diamond:
                return svg`
                    <polygon
                        data-object-id="${value.id}"
                        points="
                            ${x + (this.cellWidth / 2)},${y + 8}
                            ${x + this.cellWidth - 8},${y + (this.cellHeight / 2)}
                            ${x + (this.cellWidth / 2)},${y + this.cellHeight - 8}
                            ${x + 8},${y + (this.cellHeight / 2)}
                        "
                        fill="#8b5cf6"
                        stroke="#1f1f1f"
                        stroke-width="2"
                        style="cursor: grab; pointer-events: auto;">
                    </polygon>
                `;

            default:
                return svg``;
        }
    }

    private handleDragOver(event: DragEvent): void {
        if (this.services === null || event.dataTransfer === null) {
            return;
        }

        if (!this.hasSupportedDragPayload(event.dataTransfer)) {
            this.hoverCell = null;
            return;
        }

        const cell = this.tryResolveCell(event);
        if (cell === null) {
            this.hoverCell = null;
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        this.hoverCell = cell;
    }

    private handleDragLeave(): void {
        this.hoverCell = null;
    }

    private handleDrop(event: DragEvent): void {
        if (this.services === null || event.dataTransfer === null) {
            return;
        }

        const payload = this.services.dragPayloadCodec.tryDeserialize(
            event.dataTransfer.getData(this.services.dragPayloadCodec.mimeType)
        );

        this.hoverCell = null;

        if (payload === null) {
            return;
        }

        const cell = this.tryResolveCell(event);
        if (cell === null) {
            return;
        }

        event.preventDefault();

        const value = this.services.canvasObjectFactory.createAtCell(
            payload.shapeKind,
            cell.column,
            cell.row
        );

        this.services.drawingObjectStore.add(value);
        this.requestUpdate();
    }

    private hasSupportedDragPayload(dataTransfer: DataTransfer): boolean {
        const mimeType = this.services?.dragPayloadCodec.mimeType;
        if (mimeType === undefined) {
            return false;
        }

        return Array.from(dataTransfer.types).includes(mimeType);
    }

    private tryResolveCell(event: DragEvent): IGridCell | null {
        if (this.services === null) {
            return null;
        }

        const stage = this.renderRoot.querySelector(".stage");
        if (!(stage instanceof SVGSVGElement)) {
            return null;
        }

        const rect = stage.getBoundingClientRect();

        return this.services.gridSnapService.trySnap({
            clientX: event.clientX,
            clientY: event.clientY,
            stageLeft: rect.left,
            stageTop: rect.top,
            stageWidth: rect.width,
            stageHeight: rect.height,
            canvasWidth: this.width,
            canvasHeight: this.height,
            cellWidth: this.cellWidth,
            cellHeight: this.cellHeight,
            columns: this.columns,
            rows: this.rows
        });
    }

    public static override styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            background:
                radial-gradient(circle at top, rgba(59, 130, 246, 0.25), transparent 30%),
                radial-gradient(circle at 85% 10%, rgba(34, 197, 94, 0.16), transparent 24%),
                linear-gradient(180deg, #020617 0%, #0f172a 100%);
        }

        .layout {
            display: grid;
            grid-template-columns: minmax(220px, 20vw) minmax(0, 1fr);
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
        }

        .menu-column {
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            border-right: 1px solid rgba(148, 163, 184, 0.18);
            background: rgba(15, 23, 42, 0.92);
        }

        .canvas-column {
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            display: flex;
        }

        .drop-surface {
            width: 100%;
            height: 100%;
        }

        .stage {
            display: block;
            width: 100%;
            height: 100%;
            background: #0f172a;
        }
    `;
}

if (!customElements.get("my-canvas")) {
    customElements.define("my-canvas", MyCanvas);
}

