import { LitElement, html, svg } from "lit";

import {
  CanvasObject,
  CORE_PLOT_THEME,
  type HitTestContext,
  PlotCanvasElement,
  type RenderContext,
} from "../../../../../packages/core-plot/src/index.ts";

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
    return svg`
      <g data-object-id=${this.id}>
        <rect
          x=${this.x}
          y=${this.y}
          width=${this.width}
          height=${this.height}
          rx="20"
          fill=${this.fill}
          stroke=${this.id === "alpha"
            ? CORE_PLOT_THEME.colors.alphaStroke
            : CORE_PLOT_THEME.colors.gammaStroke}
          stroke-width="2"
        ></rect>
        <text
          x=${this.x + 18}
          y=${this.y + 34}
          fill=${CORE_PLOT_THEME.colors.textPrimary}
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
    return svg`
      <g data-object-id=${this.id}>
        <circle
          cx=${this.cx}
          cy=${this.cy}
          r=${this.radius}
          fill=${this.fill}
          stroke=${CORE_PLOT_THEME.colors.betaStroke}
          stroke-width="2"
        ></circle>
        <text
          x=${this.cx - 36}
          y=${this.cy + 6}
          fill=${CORE_PLOT_THEME.colors.textPrimary}
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
      <style>
        :host {
          display: block;
        }

        .page {
          display: grid;
          gap: 26px;
        }

        .hero {
          display: grid;
          gap: 10px;
          align-items: start;
        }

        .eyebrow {
          font: 12px/1.2 "IBM Plex Mono", "Fira Code", monospace;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: #c8a97c;
        }

        h1 {
          margin: 0;
          font: 600 52px/0.94 "Segoe UI", sans-serif;
          letter-spacing: -0.05em;
          max-width: 12ch;
          color: ${CORE_PLOT_THEME.colors.textPrimary};
        }

        p {
          margin: 0;
          max-width: 66ch;
          color: ${CORE_PLOT_THEME.colors.textMuted};
          font: 16px/1.6 ${CORE_PLOT_THEME.typography.fontFamily.ui};
        }

        .notes {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .note {
          padding: 16px 18px;
          border-radius: 18px;
          background: ${CORE_PLOT_THEME.colors.panelSurface};
          border: 1px solid ${CORE_PLOT_THEME.colors.panelBorder};
          font: 13px/1.5 ${CORE_PLOT_THEME.typography.fontFamily.ui};
          color: ${CORE_PLOT_THEME.colors.textSecondary};
        }

        @media (max-width: 900px) {
          .notes {
            grid-template-columns: 1fr;
          }
        }
      </style>
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
