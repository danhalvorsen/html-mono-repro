import { LitElement, html } from "lit";

import {
  CORE_PLOT_THEME,
  CoordinateSystem,
  PlotCanvasElement,
  Point,
} from "../../../../../packages/core-plot/src/index.ts";

export class SprintTwoView extends LitElement {
  protected override firstUpdated(): void {
    const canvas = this.renderRoot.querySelector("plot-canvas");
    if (!(canvas instanceof PlotCanvasElement)) {
      return;
    }

    canvas.registerObject(
      new CoordinateSystem(
        canvas,
        "coordinate-system-demo",
        [
          new Point(-7, -3, "A"),
          new Point(-2, 5, "B"),
          new Point(3, 2, "C"),
          new Point(8, 7, "D"),
        ],
      ),
    );
  }

  protected override render() {
    return html`
      <style>
        :host {
          display: block;
        }

        .page {
          display: grid;
          gap: 18px;
        }

        .panel {
          padding: 28px;
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(239, 232, 217, 0.1);
        }

        .eyebrow {
          font: 12px/1.2 "IBM Plex Mono", "Fira Code", monospace;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: ${CORE_PLOT_THEME.colors.textAccent};
        }

        h1 {
          margin: 0 0 10px;
          font: 600 52px/0.94 ${CORE_PLOT_THEME.typography.fontFamily.ui};
          letter-spacing: -0.05em;
          color: ${CORE_PLOT_THEME.colors.textPrimary};
        }

        p,
        li {
          margin: 0;
          color: ${CORE_PLOT_THEME.colors.textMuted};
          font: 16px/1.6 ${CORE_PLOT_THEME.typography.fontFamily.ui};
        }

        ul {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 10px;
        }
      </style>
      <section class="page">
        <article class="panel">
          <div class="eyebrow">Sprint 2 Delivery</div>
          <h1>Coordinate system, axes, and mapping controller.</h1>
          <p>
            This view now renders a real coordinate system inside the shared plot canvas with
            horizontal and vertical axes, mapped Cartesian points, and controller-based hosting.
          </p>
        </article>

        <article class="panel">
          <ul>
            <li>CoordinateSystem as a CanvasObject</li>
            <li>Horizontal and vertical Axis objects</li>
            <li>Point as a domain object</li>
            <li>MappingController for Cartesian and SVG coordinates</li>
            <li>Axis endpoint interaction and range change behavior</li>
          </ul>
        </article>

        <plot-canvas></plot-canvas>
      </section>
    `;
  }
}

customElements.define("sprint-two-view", SprintTwoView);
