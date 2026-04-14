import { LitElement, html, svg } from "lit";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import { CanvasObjectRegistry } from "./core/canvas-object-registry.js";
import type { CanvasObject } from "./core/canvas-object.js";
import type { RenderContext } from "./core/render-context.js";
import { DragController } from "./controllers/drag-controller.js";
import { GridController } from "./controllers/grid-controller.js";
import { MouseController } from "./controllers/mouse-controller.js";
import { OnClickController } from "./controllers/on-click-controller.js";
import { OnDoubleClickController } from "./controllers/on-double-click-controller.js";
import { OnRangeChangeController } from "./controllers/on-range-change-controller.js";
import { OnScaleController } from "./controllers/on-scale-controller.js";
import { SnapController } from "./controllers/snap-controller.js";
import { CoordinateSystem } from "./coordinates/coordinate-system.js";
import { CanvasHitTestService } from "./services/canvas-hit-test-service.js";
import { QuadTreeCanvasSpatialIndex } from "./services/canvas-spatial-index.js";
import { CANVAS_OVERLAY_ATTRS, PLOT_CANVAS_STYLES } from "./styles/component-styles.js";

export interface PlotCanvasSnapshot {
  readonly pointerX: number;
  readonly pointerY: number;
  readonly selectedObjectId: string | null;
  readonly doubleClickedObjectId: string | null;
  readonly dragTargetId: string | null;
  readonly dragDeltaX: number;
  readonly dragDeltaY: number;
}

export class PlotCanvasElement extends LitElement {
  public static override styles = [PLOT_CANVAS_STYLES];
  private readonly svgRef: Ref<SVGSVGElement> = createRef();
  private readonly registry = new CanvasObjectRegistry();
  private readonly mouseController = new MouseController(this, () => this.svgRef.value ?? null);
  private readonly dragController = new DragController(this, this.mouseController);
  private readonly gridController = new GridController(this);
  private readonly snapController = new SnapController(this);
  private readonly hitTestService = new CanvasHitTestService(
    this.registry,
    new QuadTreeCanvasSpatialIndex(),
    () => this.getCurrentRenderContext(),
  );
  private readonly onClickController = new OnClickController(
    this,
    this.hitTestService,
    this.mouseController,
  );
  private readonly onDoubleClickController = new OnDoubleClickController(
    this,
    this.hitTestService,
    this.mouseController,
  );
  private readonly onScaleController = new OnScaleController(this);
  private readonly onRangeChangeController = new OnRangeChangeController(this, this.dragController);

  public registerObject(object: CanvasObject): void {
    this.registry.register(object);
    this.requestUpdate();
  }

  public getSnapshot(): PlotCanvasSnapshot {
    const pointer = this.mouseController.pointer;
    const drag = this.dragController.state;

    return {
      pointerX: pointer.canvasX,
      pointerY: pointer.canvasY,
      selectedObjectId: this.onClickController.selection?.id ?? null,
      doubleClickedObjectId: this.onDoubleClickController.lastTarget?.id ?? null,
      dragTargetId: drag.target?.id ?? null,
      dragDeltaX: drag.deltaX,
      dragDeltaY: drag.deltaY,
    };
  }

  protected override createRenderRoot(): ShadowRoot {
    return this.attachShadow({ mode: "open" });
  }

  protected override render() {
    const width = 840;
    const height = 520;
    const renderContext = this.getCurrentRenderContext(width, height);
    const registeredObjects = this.registry.getAll();
    const coordinateSystem = registeredObjects.find(
      (object): object is CoordinateSystem => object instanceof CoordinateSystem,
    ) ?? null;
    const objects = registeredObjects.map((object) => object.render(renderContext));
    const drag = this.dragController.state;
    const pointer = this.mouseController.pointer;
    const snapped = coordinateSystem !== null
      ? coordinateSystem.snapSvgPoint({ x: pointer.canvasX, y: pointer.canvasY }, renderContext)
      : this.snapController.snap({
          x: pointer.canvasX,
          y: pointer.canvasY,
        });
    const grid = coordinateSystem !== null
      ? this.gridController.renderLines(coordinateSystem.getGridLines(renderContext))
      : this.gridController.render(width, height);

    return html`
      <div class="shell">
        <svg
          ${ref(this.svgRef)}
          viewBox="0 0 ${width} ${height}"
          @pointerdown=${this.handlePointerDown}
          @pointermove=${this.handlePointerMove}
          @pointerup=${this.handlePointerUp}
          @pointercancel=${this.handlePointerCancel}
          @lostpointercapture=${this.handleLostPointerCapture}
          @contextmenu=${this.handleContextMenu}
          @wheel=${this.handleWheel}
          tabindex="0"
          @keydown=${this.handleKeyDown}
        >
          ${grid} ${objects}
          <g class="overlay">
            <circle cx=${pointer.canvasX} cy=${pointer.canvasY} r="5" fill=${CANVAS_OVERLAY_ATTRS.overlayFill}></circle>
            <circle cx=${pointer.canvasX} cy=${pointer.canvasY} r="5" fill=${CANVAS_OVERLAY_ATTRS.overlayFill}></circle>
            <circle
              cx=${snapped.x}
              cy=${snapped.y}
              r="7"
              fill="none"
              stroke=${CANVAS_OVERLAY_ATTRS.overlayStroke}
              stroke-dasharray="4 4"
            ></circle>
            ${drag.isActive
              ? svg`
                  <line
                    x1=${drag.startX}
                    y1=${drag.startY}
                    x2=${drag.currentX}
                    y2=${drag.currentY}
                    stroke=${CANVAS_OVERLAY_ATTRS.overlayStroke}
                    stroke-width=${String(CANVAS_OVERLAY_ATTRS.overlayStrokeWidth)}
                    stroke-dasharray=${CANVAS_OVERLAY_ATTRS.overlayDash}
                  ></line>
                `
              : svg``}
            <text x="24" y="34">pointer ${pointer.canvasX.toFixed(1)}, ${pointer.canvasY.toFixed(1)}</text>
            <text x="24" y="54">snap ${snapped.x.toFixed(1)}, ${snapped.y.toFixed(1)}</text>
            ${snapped.label !== undefined
              ? svg`<text x="24" y="74">cartesian ${snapped.label}</text>`
              : svg``}
          </g>
        </svg>

        <div class="panel">
          <div class="stat">
            <span class="label">Selected</span>
            <span class="value">${this.onClickController.selection?.id ?? "none"}</span>
          </div>
          <div class="stat">
            <span class="label">Double Click</span>
            <span class="value">${this.onDoubleClickController.lastTarget?.id ?? "none"}</span>
          </div>
          <div class="stat">
            <span class="label">Drag</span>
            <span class="value">
              ${drag.target?.id ?? "none"} (${drag.deltaX.toFixed(1)}, ${drag.deltaY.toFixed(1)})
            </span>
          </div>
        </div>
      </div>
    `;
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) {
      this.cancelActiveInteraction();
      return;
    }
    const pointer = this.mouseController.pointer;
    const target = this.hitTestService.queryTopMost({
      x: pointer.canvasX,
      y: pointer.canvasY,
    });
    const activeDrag = this.dragController.state;

    if (
      activeDrag.phase !== "idle" &&
      (target === null || target.id !== activeDrag.target?.id)
    ) {
      this.cancelActiveInteraction();
      return;
    }

    this.svgRef.value?.setPointerCapture(event.pointerId);

    if (target !== null && target.getCapabilities().draggable === true) {
      this.dragController.startDrag(target);
    }
  };

  private readonly handlePointerMove = (): void => {
    this.dragController.updateDrag();
    this.onRangeChangeController.applyActiveRangeChange();
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    this.stopActiveInteraction(event.pointerId);
  };

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    this.cancelActiveInteraction(event.pointerId);
  };

  private readonly handleLostPointerCapture = (): void => {
    this.cancelActiveInteraction();
  };

  private readonly handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.onScaleController.beginScale(event.deltaY);
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    this.cancelActiveInteraction();
  };

  private readonly handleContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
    this.cancelActiveInteraction();
  };

  private getCurrentRenderContext(width = 840, height = 520): RenderContext {
    return {
      width,
      height,
      selectedObjectId: this.onClickController.selection?.id ?? null,
    };
  }

  private stopActiveInteraction(pointerId?: number): void {
    this.onRangeChangeController.endRangeChange();
    this.dragController.endDrag();
    this.releaseActivePointerCapture(pointerId);
  }

  private cancelActiveInteraction(pointerId?: number): void {
    this.onRangeChangeController.cancelRangeChange();
    this.dragController.cancelDrag();
    this.releaseActivePointerCapture(pointerId);
  }

  private releaseActivePointerCapture(pointerId?: number): void {
    if (pointerId !== undefined && this.svgRef.value?.hasPointerCapture(pointerId) === true) {
      this.svgRef.value.releasePointerCapture(pointerId);
    }
  }
}

customElements.define("plot-canvas", PlotCanvasElement);
