import { LitElement, html } from "lit";

import {
  CoordinateSystem,
  PlotCanvasElement,
  Point,
  SPRINT_PANEL_VIEW_STYLES,
} from "@monorepo/core-plot";

export class SprintTwoView extends LitElement {
  public static override styles = [SPRINT_PANEL_VIEW_STYLES];

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
