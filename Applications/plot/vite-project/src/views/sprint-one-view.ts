import { LitElement, html, svg } from "lit";

import {
  CanvasObject,
  CORE_PLOT_THEME,
  SPRINT_ONE_VIEW_STYLES,
  type HitTestContext,
  PlotCanvasElement,
  type RenderContext,
} from "@monorepo/core-plot";

class DemoRectangleObject extends CanvasObject {
  private readonly x: number;
  private readonly y: number;
  private readonly width: number;
  private readonly height: number;
  private readonly fill: string;

  public constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
  ) {
    super(id);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fill = fill;
  }

  public override getCapabilities() {
    return {
      clickable: true,
      draggable: true,
      doubleClickable: true,
      scalable: true,
    };
  }

  public override render(_context: RenderContext) {
    const highlighted = _context.selectedObjectId === this.id;
    return svg`
      <g data-object-id=${this.id}>
        <rect
          x=${this.x}
          y=${this.y}
          width=${this.width}
          height=${this.height}
          rx="20"
          fill=${this.fill}
          stroke=${highlighted
            ? CORE_PLOT_THEME.colors.routeActive
            : this.id === "alpha"
            ? CORE_PLOT_THEME.colors.alphaStroke
            : CORE_PLOT_THEME.colors.gammaStroke}
          stroke-width=${highlighted ? "3" : "2"}
        ></rect>
        <text
          x=${this.x + 18}
          y=${this.y + 34}
          fill=${highlighted ? CORE_PLOT_THEME.colors.routeActive : CORE_PLOT_THEME.colors.textPrimary}
          font-size="14"
          font-family=${CORE_PLOT_THEME.typography.fontFamily.ui}
        >
          ${this.id}
        </text>
      </g>
    `;
  }

  public override hitTest(context: HitTestContext): boolean {
    return (
      context.x >= this.x &&
      context.x <= this.x + this.width &&
      context.y >= this.y &&
      context.y <= this.y + this.height
    );
  }
}

class DemoCircleObject extends CanvasObject {
  private readonly cx: number;
  private readonly cy: number;
  private readonly radius: number;
  private readonly fill: string;

  public constructor(
    id: string,
    cx: number,
    cy: number,
    radius: number,
    fill: string,
  ) {
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

  public override render(_context: RenderContext) {
    const highlighted = _context.selectedObjectId === this.id;
    return svg`
      <g data-object-id=${this.id}>
        <circle
          cx=${this.cx}
          cy=${this.cy}
          r=${this.radius}
          fill=${this.fill}
          stroke=${highlighted ? CORE_PLOT_THEME.colors.routeActive : CORE_PLOT_THEME.colors.betaStroke}
          stroke-width=${highlighted ? "3" : "2"}
        ></circle>
        <text
          x=${this.cx - 36}
          y=${this.cy + 6}
          fill=${highlighted ? CORE_PLOT_THEME.colors.routeActive : CORE_PLOT_THEME.colors.textPrimary}
          font-size="14"
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
}

export class SprintOneView extends LitElement {
  public static override styles = [SPRINT_ONE_VIEW_STYLES];

  protected override firstUpdated(): void {
    const canvas = this.renderRoot.querySelector("plot-canvas");
    if (!(canvas instanceof PlotCanvasElement)) {
      return;
    }

    canvas.registerObject(new DemoRectangleObject("alpha", 92, 104, 220, 118, CORE_PLOT_THEME.colors.alphaFill));
    canvas.registerObject(new DemoCircleObject("beta", 452, 216, 68, CORE_PLOT_THEME.colors.betaFill));
    canvas.registerObject(new DemoRectangleObject("gamma", 534, 298, 172, 96, CORE_PLOT_THEME.colors.gammaFill));
  }

  protected override render() {
    return html`
      <div class="page">
        <header class="hero">
          <div class="eyebrow">Sprint 1 Delivery</div>
          <h1>Canvas foundation with controller-driven interaction.</h1>
          <p>
            The demo hosts a Lit-based plot canvas, registers deterministic canvas objects, and
            exposes pointer, hit-test, click, double-click, drag, and snap behavior.
          </p>
        </header>

        <div class="notes">
          <div class="note">Click the top-most shape to test hit routing.</div>
          <div class="note">Drag inside a draggable shape to see drag target and delta.</div>
          <div class="note">Move the pointer to compare live and snapped coordinates.</div>
        </div>

        <plot-canvas></plot-canvas>
      </div>
    `;
  }
}

customElements.define("sprint-one-view", SprintOneView);
