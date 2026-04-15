import { LitElement, html } from "lit";

import {
  ArrowBuilder,
  AxisVisualFactory,
  CircleBuilder,
  CoordinateSystem,
  CORE_PLOT_THEME,
  LineBuilder,
  PlotCanvasElement,
  Point,
  RectangleBuilder,
  SPRINT_THREE_VIEW_STYLES,
} from "@monorepo/core-plot";

export class SprintThreeView extends LitElement {
  public static override styles = [SPRINT_THREE_VIEW_STYLES];

  protected override firstUpdated(): void {
    const canvas = this.renderRoot.querySelector("plot-canvas");
    if (!(canvas instanceof PlotCanvasElement)) {
      return;
    }

    canvas.registerObject(
      new CoordinateSystem(
        canvas,
        "coordinate-system-sprint-three",
        [
          new Point(-8, -4, "A"),
          new Point(-3, 3, "B"),
          new Point(2, -1, "C"),
          new Point(7, 6, "D"),
        ],
      ),
    );
  }

  protected override render() {
    const primitiveLine = new LineBuilder()
      .withPoints(64, 76, 268, 76)
      .withStyle({
        stroke: CORE_PLOT_THEME.colors.textPrimary,
        strokeWidth: 3,
        state: "normal",
      })
      .build();

    const primitiveCircle = new CircleBuilder()
      .withCenter(146, 180)
      .withRadius(42)
      .withStyle({
        fill: CORE_PLOT_THEME.colors.betaFill,
        stroke: CORE_PLOT_THEME.colors.betaStroke,
        strokeWidth: 2,
        state: "normal",
      })
      .build();

    const primitiveRectangle = new RectangleBuilder()
      .withBounds(236, 136, 156, 88)
      .withCornerRadius(20)
      .withStyle({
        fill: CORE_PLOT_THEME.colors.alphaFill,
        stroke: CORE_PLOT_THEME.colors.alphaStroke,
        strokeWidth: 2,
        state: "normal",
      })
      .build();

    const primitiveArrow = new ArrowBuilder()
      .withPoints(454, 82, 430, 68, 430, 96)
      .withStyle({
        stroke: CORE_PLOT_THEME.colors.routeActive,
        strokeWidth: 3,
        state: "highlighted",
      })
      .build();

    const axisVisual = new AxisVisualFactory().create({
      orientation: "horizontal",
      startX: 70,
      startY: 144,
      endX: 530,
      endY: 144,
      zeroX: 300,
      zeroY: 144,
      tickValues: [-4, -2, 0, 2, 4],
      rangeMin: -4,
      rangeMax: 4,
      highlighted: false,
    });

    return html`<section class="page">
        <article class="panel hero">
          <div class="eyebrow">Sprint 3 Delivery</div>
          <h1>Primitive SVG composition with builders, factories, and style states.</h1>
          <p>
            This view demonstrates the rendering architecture introduced in Sprint 3. The visuals
            below are assembled from SVG primitives and factory-composed parts rather than inline
            ad hoc geometry.
          </p>
        </article>

        <article class="panel">
          <h2>Composed Coordinate System</h2>
          <p>
            The first delivery proof is a real coordinate-system canvas rendered through the new
            primitive and factory-backed composition path. Axes are built from one line, one arrow,
            and multiple tick compositions.
          </p>
          <plot-canvas></plot-canvas>
        </article>

        <section class="grid">
          <article class="panel">
            <h2>Primitive Showcase</h2>
            <p>
              The left canvas shows the four primitive types created through builders: line,
              circle, rectangle, and arrow.
            </p>
            <svg viewBox="0 0 620 280" aria-label="Sprint 3 primitive showcase">
              ${primitiveLine.render()}
              ${primitiveCircle.render()}
              ${primitiveRectangle.render()}
              ${primitiveArrow.render()}
              <text
                x="64"
                y="48"
                fill=${CORE_PLOT_THEME.colors.textSecondary}
                font-size="13"
                font-family=${CORE_PLOT_THEME.typography.fontFamily.ui}
              >
                Built from primitive builders
              </text>
            </svg>
            <p class="caption">
              Normal and highlighted states are expressed through token-driven style input rather
              than handwritten per-shape color choices.
            </p>
          </article>

          <article class="panel">
            <h2>Factory Composition</h2>
            <p>
              The right side demonstrates <code>AxisVisualFactory</code> producing an axis from
              one line, one arrow, and multiple <code>TickSvg</code> compositions.
            </p>
            <svg viewBox="0 0 620 280" aria-label="Sprint 3 axis factory composition">
              <rect
                x="36"
                y="44"
                width="548"
                height="182"
                rx="18"
                fill=${CORE_PLOT_THEME.colors.panelSurfaceSubtle}
                stroke=${CORE_PLOT_THEME.colors.panelBorder}
              ></rect>
              ${axisVisual.line.render()}
              ${axisVisual.arrows.map((arrow) => arrow.render())}
              ${axisVisual.ticks.map((tick) => tick.render())}
              <text
                x="54"
                y="84"
                fill=${CORE_PLOT_THEME.colors.textSecondary}
                font-size="13"
                font-family=${CORE_PLOT_THEME.typography.fontFamily.ui}
              >
                Axis = line primitive + arrow primitive + TickSvg compositions
              </text>
            </svg>
            <div class="legend">
              <div class="chip">Builder output is immutable and returned as plain objects.</div>
              <div class="chip">Factory output composes primitives without embedding behavior.</div>
              <div class="chip">Tick labels and marks are rendered through reusable <code>TickSvg</code>.</div>
              <div class="chip">This keeps rendering composable while Lit stays at the template level.</div>
            </div>
          </article>
        </section>

        <article class="panel">
          <h2>Sprint 3 Scope Delivered</h2>
          <ul class="notes">
            <li>Primitive SVG classes exist for line, circle, rectangle, and arrow.</li>
            <li>Primitive builders construct immutable visual objects.</li>
            <li><code>AxisVisualFactory</code> composes axis visuals from primitives and ticks.</li>
            <li>Token-driven style inputs support normal and highlighted visual states.</li>
          </ul>
        </article>
      </section>
    `;
  }
}

customElements.define("sprint-three-view", SprintThreeView);
