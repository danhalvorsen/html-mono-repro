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
import { OnScaleController } from "./controllers/on-scale-controller.js";
import { SnapController } from "./controllers/snap-controller.js";
import { CoordinateSystem } from "./coordinates/coordinate-system.js";
import { CORE_PLOT_THEME } from "./styles/core-plot-style-system.js";

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
  private readonly svgRef: Ref<SVGSVGElement> = createRef();
  private readonly registry = new CanvasObjectRegistry();
  private readonly mouseController = new MouseController(this, () => this.svgRef.value ?? null);
  private readonly dragController = new DragController(this, this.mouseController);
  private readonly gridController = new GridController(this);
  private readonly snapController = new SnapController(this);
  private readonly onClickController = new OnClickController(
    this,
    this.registry,
    this.mouseController,
  );
  private readonly onDoubleClickController = new OnDoubleClickController(
    this,
    this.registry,
    this.mouseController,
  );
  private readonly onScaleController = new OnScaleController(this);

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
    const renderContext: RenderContext = { width, height };
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
      <style>
        :host {
          display: block;
          color: ${CORE_PLOT_THEME.colors.canvasShell};
        }

        .shell {
          display: grid;
          gap: 18px;
        }

        svg {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 22px;
          background:
            radial-gradient(circle at 20% 0%, rgba(203, 139, 62, 0.16), transparent 32%),
            linear-gradient(180deg, #17181c, ${CORE_PLOT_THEME.colors.canvasSurface});
          border: 1px solid ${CORE_PLOT_THEME.colors.panelBorder};
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          touch-action: none;
        }

        [data-role='grid'] line {
          stroke: ${CORE_PLOT_THEME.colors.grid};
          stroke-width: ${String(CORE_PLOT_THEME.metrics.gridStrokeWidth)};
        }

        .overlay text {
          fill: ${CORE_PLOT_THEME.colors.canvasShell};
          font: 12px/1.2 ${CORE_PLOT_THEME.typography.fontFamily.ui};
        }

        .panel {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          font: 12px/1.4 "IBM Plex Mono", "Fira Code", monospace;
        }

        .stat {
          padding: 12px 14px;
          border-radius: 14px;
          background: ${CORE_PLOT_THEME.colors.panelSurface};
          border: 1px solid ${CORE_PLOT_THEME.colors.panelBorder};
        }

        .label {
          display: block;
          color: ${CORE_PLOT_THEME.colors.textMuted};
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .value {
          color: ${CORE_PLOT_THEME.colors.textPrimary};
        }
      </style>
      <div class="shell">
        <svg
          ${ref(this.svgRef)}
          viewBox="0 0 ${width} ${height}"
          @pointerdown=${this.handlePointerDown}
          @pointermove=${this.handlePointerMove}
          @pointerup=${this.handlePointerUp}
          @wheel=${this.handleWheel}
        >
          ${grid} ${objects}
          <g class="overlay">
            <circle cx=${pointer.canvasX} cy=${pointer.canvasY} r="5" fill="#f59f46"></circle>
            <circle cx=${pointer.canvasX} cy=${pointer.canvasY} r="5" fill=${CORE_PLOT_THEME.colors.overlay}></circle>
            <circle
              cx=${snapped.x}
              cy=${snapped.y}
              r="7"
              fill="none"
              stroke=${CORE_PLOT_THEME.colors.overlay}
              stroke-dasharray="4 4"
            ></circle>
            ${drag.isActive
              ? svg`
                  <line
                    x1=${drag.startX}
                    y1=${drag.startY}
                    x2=${drag.currentX}
                    y2=${drag.currentY}
                    stroke=${CORE_PLOT_THEME.colors.overlay}
                    stroke-width=${String(CORE_PLOT_THEME.metrics.overlayStrokeWidth)}
                    stroke-dasharray=${CORE_PLOT_THEME.metrics.overlayDash}
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

  private readonly handlePointerDown = (): void => {
    const pointer = this.mouseController.pointer;
    const target = this.registry.hitTestTopMost({
      x: pointer.canvasX,
      y: pointer.canvasY,
    });

    if (target !== null && target.getCapabilities().draggable === true) {
      this.dragController.startDrag(target);
    }
  };

  private readonly handlePointerMove = (): void => {
    this.dragController.updateDrag();
  };

  private readonly handlePointerUp = (): void => {
    this.dragController.endDrag();
  };

  private readonly handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.onScaleController.beginScale(event.deltaY);
  };
}

customElements.define("plot-canvas", PlotCanvasElement);
