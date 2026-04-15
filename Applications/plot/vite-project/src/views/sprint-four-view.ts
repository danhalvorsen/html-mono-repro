import { LitElement, html } from "lit";
import { InterpolatedCurve } from "@monorepo/core-plot-curve";

import {
  CoordinateSystem,
  PlotCanvasElement,
  PlotRectangle,
  Point,
  SPRINT_PANEL_VIEW_STYLES,
} from "@monorepo/core-plot";

export class SprintFourView extends LitElement {
  public static override styles = [SPRINT_PANEL_VIEW_STYLES];

  protected override firstUpdated(): void {
    const canvas = this.renderRoot.querySelector("plot-canvas");
    if (!(canvas instanceof PlotCanvasElement)) {
      return;
    }

    const points = [
      new Point(-7, -3, "A"),
      new Point(-2, 5, "B"),
      new Point(3, 2, "C"),
      new Point(8, 7, "D"),
    ];
    const rectangles = [
      new PlotRectangle({ x: -8, y: -6, width: 4, height: 3 }, "Zone A"),
      new PlotRectangle({ x: 1, y: 1, width: 3, height: 5 }, "Zone B"),
    ];

    canvas.registerObject(
      new CoordinateSystem(
        canvas,
        "coordinate-system-sprint-four-demo",
        points,
        rectangles,
        undefined,
        undefined,
        [new InterpolatedCurve(points, "g")],
      ),
    );
  }

  protected override render() {
    return html`
      <section class="page">
        <article class="panel hero">
          <div class="eyebrow">Sprint 4 Delivery</div>
          <h1>Rectangles and interpolated curves mapped into the coordinate system.</h1>
          <p>
            Sprint 4 now includes the first curve slice as well. Rectangles stay stored as
            <code>Rectangle2</code> domain objects in Cartesian space, and the curve through
            <code>A..D</code> is interpolated in Cartesian space before the result is mapped to SVG.
          </p>
        </article>

        <article class="panel">
          <ul>
            <li>Rectangles use Cartesian coordinates as source of truth.</li>
            <li>Rectangle geometry is mapped deterministically through MappingController.</li>
            <li>Curve interpolation uses the existing core-math Catmull-Rom spline.</li>
            <li>The curve is calculated in Cartesian space before SVG mapping.</li>
            <li>Rectangle visuals live inside the existing CoordinateSystem CanvasObject.</li>
            <li>Points, rectangles, and the interpolated curve now share the same coordinate system.</li>
          </ul>
        </article>

        <plot-canvas></plot-canvas>
      </section>
    `;
  }
}

customElements.define("sprint-four-view", SprintFourView);
