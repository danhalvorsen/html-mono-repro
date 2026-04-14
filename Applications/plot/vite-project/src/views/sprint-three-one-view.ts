import { LitElement, html, svg } from "lit";
import { state } from "lit/decorators.js";

import {
  Axis,
  AxisRange,
  AxisTickDensityPolicy,
  AXIS_INTERVAL_DEMO_STYLES,
  CanvasObject,
  type CanvasObjectBounds,
  type CanvasObjectDragContext,
  CORE_PLOT_THEME,
  type HitTestContext,
  PlotCanvasElement,
  type RenderContext,
  SPRINT_PANEL_VIEW_STYLES,
} from "@monorepo/core-plot";

class SelectionRectangleObject extends CanvasObject {
  private bounds: CanvasObjectBounds;
  private readonly fill: string;
  private originBounds: CanvasObjectBounds;

  public constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
  ) {
    super(id);
    this.bounds = Object.freeze({ x, y, width, height });
    this.originBounds = this.bounds;
    this.fill = fill;
  }

  public override getCapabilities() {
    return {
      clickable: true,
      draggable: true,
      doubleClickable: true,
    };
  }

  public override render(context: RenderContext) {
    const highlighted = context.selectedObjectId === this.id;
    return svg`
      <g data-object-id=${this.id}>
        <rect
          x=${this.bounds.x}
          y=${this.bounds.y}
          width=${this.bounds.width}
          height=${this.bounds.height}
          rx="24"
          fill=${this.fill}
          stroke=${highlighted ? CORE_PLOT_THEME.colors.routeActive : CORE_PLOT_THEME.colors.panelBorder}
          stroke-width=${highlighted ? "4" : "2"}
        ></rect>
        <text
          x=${this.bounds.x + 18}
          y=${this.bounds.y + 36}
          fill=${highlighted ? CORE_PLOT_THEME.colors.routeActive : CORE_PLOT_THEME.colors.textPrimary}
          font-size="16"
          font-family=${CORE_PLOT_THEME.typography.fontFamily.ui}
        >
          ${this.id}
        </text>
      </g>
    `;
  }

  public override hitTest(context: HitTestContext): boolean {
    return (
      context.x >= this.bounds.x &&
      context.x <= this.bounds.x + this.bounds.width &&
      context.y >= this.bounds.y &&
      context.y <= this.bounds.y + this.bounds.height
    );
  }

  public override getBounds(): CanvasObjectBounds {
    return this.bounds;
  }

  public override onDragStart(_context: CanvasObjectDragContext): void {
    this.originBounds = this.bounds;
  }

  public override onDragMove(context: { deltaX: number; deltaY: number }): void {
    this.bounds = Object.freeze({
      x: this.originBounds.x + context.deltaX,
      y: this.originBounds.y + context.deltaY,
      width: this.originBounds.width,
      height: this.originBounds.height,
    });
  }

  public override onDragCancel(): void {
    this.bounds = this.originBounds;
  }
}

class SelectionCircleObject extends CanvasObject {
  private cx: number;
  private cy: number;
  private readonly radius: number;
  private readonly fill: string;
  private originX = 0;
  private originY = 0;

  public constructor(id: string, cx: number, cy: number, radius: number, fill: string) {
    super(id);
    this.cx = cx;
    this.cy = cy;
    this.radius = radius;
    this.fill = fill;
  }

  public override getCapabilities() {
    return {
      clickable: true,
      draggable: true,
    };
  }

  public override render(context: RenderContext) {
    const highlighted = context.selectedObjectId === this.id;
    return svg`
      <g data-object-id=${this.id}>
        <circle
          cx=${this.cx}
          cy=${this.cy}
          r=${this.radius}
          fill=${this.fill}
          stroke=${highlighted ? CORE_PLOT_THEME.colors.routeActive : CORE_PLOT_THEME.colors.betaStroke}
          stroke-width=${highlighted ? "4" : "2"}
        ></circle>
        <circle
          cx=${this.cx}
          cy=${this.cy}
          r=${highlighted ? this.radius + 10 : this.radius + 4}
          fill="none"
          stroke=${highlighted ? CORE_PLOT_THEME.colors.routeActive : CORE_PLOT_THEME.colors.selectionRingMuted}
          stroke-width=${highlighted ? "1.5" : String(CORE_PLOT_THEME.metrics.selectionRingMutedWidth)}
          stroke-dasharray=${highlighted ? "6 6" : CORE_PLOT_THEME.metrics.selectionRingMutedDash}
        ></circle>
        <text
          x=${this.cx - 34}
          y=${this.cy + 6}
          fill=${highlighted ? CORE_PLOT_THEME.colors.routeActive : CORE_PLOT_THEME.colors.textPrimary}
          font-size="16"
          font-family=${CORE_PLOT_THEME.typography.fontFamily.ui}
        >
          ${this.id}
        </text>
      </g>
    `;
  }

  public override hitTest(context: HitTestContext): boolean {
    const dx = context.x - this.cx;
    const dy = context.y - this.cy;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  public override getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.cx - this.radius,
      y: this.cy - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }

  public override onDragStart(_context: CanvasObjectDragContext): void {
    this.originX = this.cx;
    this.originY = this.cy;
  }

  public override onDragMove(context: { deltaX: number; deltaY: number }): void {
    this.cx = this.originX + context.deltaX;
    this.cy = this.originY + context.deltaY;
  }

  public override onDragCancel(): void {
    this.cx = this.originX;
    this.cy = this.originY;
  }
}

class DemoAxisObject extends Axis {
  private readonly tickDensityPolicy = new AxisTickDensityPolicy();

  public constructor() {
    super("interactive-axis", "horizontal", new AxisRange(-10, 10));
  }

  public override render(context: RenderContext) {
    const startX = 104;
    const endX = context.width - 104;
    const axisY = Math.round(context.height * 0.52);
    const range = this.getRange();
    const normalizedZero = (0 - range.min) / range.span();

    this.setLayout({
      startX,
      startY: axisY,
      endX,
      endY: axisY,
      zeroX: startX + normalizedZero * (endX - startX),
      zeroY: axisY,
      tickValues: this.tickDensityPolicy.buildVisibleTickValues(range, endX - startX, 52),
    });

    return super.render(context);
  }
}

export class SprintThreeOneView extends LitElement {
  public static override styles = [SPRINT_PANEL_VIEW_STYLES];

  protected override firstUpdated(): void {
    const canvas = this.renderRoot.querySelector("plot-canvas");
    if (!(canvas instanceof PlotCanvasElement)) {
      return;
    }

    canvas.registerObject(
      new SelectionRectangleObject("axis-target", 78, 94, 220, 124, CORE_PLOT_THEME.colors.alphaFill),
    );
    canvas.registerObject(
      new SelectionCircleObject("plot-target", 458, 180, 70, CORE_PLOT_THEME.colors.betaFill),
    );
    canvas.registerObject(
      new SelectionRectangleObject("curve-target", 560, 286, 176, 98, CORE_PLOT_THEME.colors.gammaFill),
    );
  }

  protected override render() {
    return html`<section class="page">
        <article class="panel">
          <div class="eyebrow">Sprint 3.1 Delivery</div>
          <h1>Click selection and highlighted token state.</h1>
          <p>
            This view demonstrates the Sprint 3.1 interaction core: top-most clickable object
            resolution and highlighted token-driven rendering for the selected target.
          </p>
        </article>

        <article class="panel">
          <h2>Axis Interval Demo</h2>
          <p>
            This focused demo shows the axis object interaction path. Drag the axis itself to the
            right to expand the interval or to the left to contract it.
          </p>
          <axis-interval-demo></axis-interval-demo>
        </article>

        <article class="panel">
          <h2>Interaction Proof</h2>
          <p>
            Click any object on the canvas to highlight it, then drag it to prove the package drag
            controller repositions the active canvas object through the shared interaction path.
          </p>
          <plot-canvas></plot-canvas>
        </article>

        <article class="panel">
          <h2>Scope</h2>
          <ul>
            <li><code>OnClickController</code> resolves the top-most clickable object.</li>
            <li>The selected object id is stored centrally at canvas render time.</li>
            <li>Objects render a highlighted token state when selected.</li>
            <li>Dragging a draggable canvas object repositions it through the package drag lifecycle.</li>
            <li>The axis interval demo previews drag-driven symmetric interval scaling on the axis itself.</li>
          </ul>
        </article>
      </section>
    `;
  }
}

customElements.define("sprint-three-one-view", SprintThreeOneView);

class AxisIntervalDemo extends LitElement {
  public static override styles = [AXIS_INTERVAL_DEMO_STYLES];
  private readonly axis = new DemoAxisObject();

  @state()
  private interactionTick = 0;

  protected override firstUpdated(): void {
    const canvas = this.renderRoot.querySelector("plot-canvas");
    if (!(canvas instanceof PlotCanvasElement)) {
      return;
    }

    canvas.registerObject(this.axis);
    canvas.addEventListener("pointermove", this.handleCanvasInteraction);
    canvas.addEventListener("pointerup", this.handleCanvasInteraction);
    canvas.addEventListener("click", this.handleCanvasInteraction);
  }

  protected override render() {
    const range = this.axis.getRange();

    return html`
      <div class="panel">
        <div class="meta">
          <span>Click the axis to highlight it, then drag it right to expand or left to contract the interval.</span>
          <span class="range">[${range.min}, ${range.max}]</span>
        </div>
        <plot-canvas data-tick=${String(this.interactionTick)}></plot-canvas>
      </div>
    `;
  }

  private readonly handleCanvasInteraction = (): void => {
    this.interactionTick += 1;
  };
}

customElements.define("axis-interval-demo", AxisIntervalDemo);
