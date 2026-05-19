import { LitElement, css, html, svg, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";
import { Polygon, SvgPolygon } from "@monorepo/game-design-svg";
import { RectanglePolygonBooleanOperations } from "@monorepo/game-polygon-boolean-api";
import "../Game/index.js";

type Point2 = {
  readonly x: number;
  readonly y: number;
};

type SvgRectangleModel = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type OutlineResult = {
  readonly composed: Polygon | null;
};

@customElement("view-svg-rectangle-draw")
export class ViewSvgRectangleDraw extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: #dde6ff;
    }

    .panel {
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #121523;
      padding: 14px;
    }

    .title {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #bdc8f4;
    }

    .hint {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #9aa6cc;
    }

    .stage {
      position: relative;
      inline-size: 900px;
      block-size: 320px;
      border: 1px solid #303a57;
      border-radius: 10px;
      overflow: hidden;
      background: #0d111a;
    }

    .toolbar {
      display: flex;
      gap: 10px;
      margin: 8px 0 10px 0;
    }

    .btn {
      border: 1px solid #385081;
      border-radius: 8px;
      background: #1a2a4d;
      color: #dbe8ff;
      padding: 8px 10px;
      font-size: 13px;
      cursor: pointer;
    }

    .btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    game-canvas {
      position: absolute;
      inset: 0;
      opacity: 0.35;
      pointer-events: none;
    }

    svg {
      position: absolute;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
      touch-action: none;
      cursor: crosshair;
      user-select: none;
      background: linear-gradient(180deg, #101726 0%, #0d121e 100%);
    }

    .result-grid {
      margin-top: 14px;
      display: grid;
      grid-template-columns: repeat(2, minmax(240px, 1fr));
      gap: 12px;
    }

    .result {
      border: 1px solid #2e3b5d;
      border-radius: 10px;
      background: #0e1422;
      padding: 8px;
    }

    .result h3 {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #9cc3ff;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .result svg {
      position: static;
      block-size: 160px;
      border: 1px solid #25324d;
      border-radius: 8px;
      background: #0b101a;
    }
  `;

  @state()
  private rectangles: readonly SvgRectangleModel[] = [];

  @state()
  private draftRectangle: SvgRectangleModel | null = null;
  @state()
  private outlineResult: OutlineResult = {
    composed: null,
  };
  private readonly booleanOperations =
    new RectanglePolygonBooleanOperations();

  private dragStart: Point2 | null = null;
  private activePointerId: number | null = null;
  private nextId = 1;

  public get storedRectangles(): readonly SvgRectangleModel[] {
    return this.rectangles;
  }

  protected render(): TemplateResult {
    return html`
      <section class="panel">
        <h2 class="title">SVG Rectangle Draw View</h2>
        <p class="hint">
          Click and drag to create/scale a rectangle. Stored rectangles: ${this.rectangles.length}
        </p>
        <div class="toolbar">
          <button
            class="btn"
            @click=${this.onGenerateOutlines}
            ?disabled=${this.rectangles.length < 2}
          >
            Generate Result
          </button>
        </div>
        <div class="stage">
          <game-canvas
            .gameObjects=${[]}
            .viewportWidth=${900}
            .viewportHeight=${320}
          ></game-canvas>
          <svg
            viewBox="0 0 900 320"
            @pointerdown=${this.onPointerDown}
            @pointermove=${this.onPointerMove}
            @pointerup=${this.onPointerUp}
            @pointercancel=${this.onPointerCancel}
          >
            ${this.rectangles.map((rectangle) =>
              this.renderSvgRectangle(rectangle, "#38bdf8", "#7dd3fc"),
            )}
            ${this.draftRectangle === null
              ? null
              : this.renderSvgRectangle(this.draftRectangle, "rgba(56,189,248,0.15)", "#67e8f9", "6 4")}
          </svg>
        </div>
        <div class="result-grid">
          ${this.renderSingleResultView("Composed", this.outlineResult.composed, "#10b981")}
        </div>
      </section>
    `;
  }

  private renderSingleResultView(
    label: string,
    polygon: Polygon | null,
    stroke: string,
  ): TemplateResult {
    return html`
      <article class="result">
        <h3>${label} (${polygon === null ? 0 : 1})</h3>
        <svg viewBox="0 0 900 320">
          ${polygon === null
            ? null
            : (() => {
                const svgPolygon = new SvgPolygon(polygon.withClosed(), {
                  fill: "rgba(255,255,255,0.05)",
                  stroke,
                  strokeWidth: 2,
                });

                return svg`${svgPolygon.svg}`;
              })()}
        </svg>
      </article>
    `;
  }

  private renderSvgRectangle(
    rectangle: SvgRectangleModel,
    fill: string,
    stroke: string,
    strokeDasharray = "",
  ) {
    return svg`
      <rect
        x=${rectangle.x}
        y=${rectangle.y}
        width=${rectangle.width}
        height=${rectangle.height}
        fill=${fill}
        stroke=${stroke}
        stroke-width="2"
        stroke-dasharray=${strokeDasharray}
      ></rect>
    `;
  }

  private onPointerDown(event: PointerEvent): void {
    if (!(event.currentTarget instanceof SVGSVGElement)) {
      return;
    }

    event.preventDefault();
    this.activePointerId = event.pointerId;
    this.dragStart = this.getLocalPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    this.draftRectangle = this.createRectangle(this.dragStart, this.dragStart, "draft");
  }

  private onPointerMove(event: PointerEvent): void {
    if (this.activePointerId !== event.pointerId || this.dragStart === null) {
      return;
    }

    const current = this.getLocalPoint(event);
    this.draftRectangle = this.createRectangle(this.dragStart, current, "draft");
  }

  private onPointerUp(event: PointerEvent): void {
    if (this.activePointerId !== event.pointerId || this.dragStart === null) {
      return;
    }

    const end = this.getLocalPoint(event);
    const finalized = this.createRectangle(
      this.dragStart,
      end,
      `svg-rectangle-${this.nextId}`,
    );

    if (event.currentTarget instanceof SVGSVGElement) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }

    this.nextId += 1;
    this.activePointerId = null;
    this.dragStart = null;
    this.draftRectangle = null;

    if (finalized.width < 2 || finalized.height < 2) {
      return;
    }

    this.rectangles = [...this.rectangles, finalized];
  }

  private onPointerCancel(event: PointerEvent): void {
    if (this.activePointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget instanceof SVGSVGElement) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }

    this.activePointerId = null;
    this.dragStart = null;
    this.draftRectangle = null;
  }

  private onGenerateOutlines(): void {
    if (this.rectangles.length < 2) {
      return;
    }

    const polygons = this.rectangles.map((rectangle) => this.rectangleToPolygon(rectangle));
    const composed = this.booleanOperations.compose(polygons);

    this.outlineResult = {
      composed: composed.withClosed(),
    };
  }

  private getLocalPoint(event: PointerEvent): Point2 {
    const target = event.currentTarget as SVGSVGElement;
    const bounds = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(900, event.clientX - bounds.left));
    const y = Math.max(0, Math.min(320, event.clientY - bounds.top));
    return { x, y };
  }

  private createRectangle(start: Point2, end: Point2, id: string): SvgRectangleModel {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    return {
      id,
      x,
      y,
      width,
      height,
    };
  }

  private rectangleToPolygon(rectangle: SvgRectangleModel): Polygon {
    return new Polygon(
      [
        new Vector2(rectangle.x, rectangle.y),
        new Vector2(rectangle.x + rectangle.width, rectangle.y),
        new Vector2(rectangle.x + rectangle.width, rectangle.y + rectangle.height),
        new Vector2(rectangle.x, rectangle.y + rectangle.height),
      ],
      true,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-svg-rectangle-draw": ViewSvgRectangleDraw;
  }
}
