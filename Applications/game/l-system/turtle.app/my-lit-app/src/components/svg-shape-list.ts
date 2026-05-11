import { LitElement, css, html, svg } from "lit";
import { customElement, property } from "lit/decorators.js";

export const SvgShapeName = {
  Line: "line",
  Segment: "segment",
  Rectangle: "rectangle",
  Square: "square",
  Ellipse: "ellipse",
  Triangle: "triangle",
  Polygon: "polygon",
  OpenPolygon: "open-polygon",
} as const;

export type SvgShapeName = (typeof SvgShapeName)[keyof typeof SvgShapeName];

export type SvgShapeListItem = {
  readonly name: SvgShapeName;
  readonly label: string;
  readonly gameDesignSvgTemplate: string;
  readonly gamePrimitive: string;
  readonly turtlePrimitive: string;
  readonly svgLibraryStatus: "available";
  readonly turtleStatus: "supported" | "planned";
  readonly commandExample: string;
};

export const SvgShapeSelectedEventName = "svg-shape-selected";

export type SvgShapeSelectedEventDetail = {
  readonly shape: SvgShapeListItem;
};

const DefaultShapes: readonly SvgShapeListItem[] = Object.freeze([
  {
    name: SvgShapeName.Line,
    label: "Line",
    gameDesignSvgTemplate: "SvgLine",
    gamePrimitive: "Line",
    turtlePrimitive: "LinePrimitive",
    svgLibraryStatus: "available",
    turtleStatus: "supported",
    commandExample: "brush line",
  },
  {
    name: SvgShapeName.Segment,
    label: "Segment",
    gameDesignSvgTemplate: "SvgSegment",
    gamePrimitive: "Segment",
    turtlePrimitive: "LinePrimitive",
    svgLibraryStatus: "available",
    turtleStatus: "supported",
    commandExample: "brush segment",
  },
  {
    name: SvgShapeName.Rectangle,
    label: "Rectangle",
    gameDesignSvgTemplate: "SvgRectangle",
    gamePrimitive: "Rectangle",
    turtlePrimitive: "RectanglePrimitive",
    svgLibraryStatus: "available",
    turtleStatus: "planned",
    commandExample: "brush rectangle 1",
  },
  {
    name: SvgShapeName.Square,
    label: "Square",
    gameDesignSvgTemplate: "SvgSquare",
    gamePrimitive: "Square",
    turtlePrimitive: "SquarePrimitive",
    svgLibraryStatus: "available",
    turtleStatus: "planned",
    commandExample: "brush square 1",
  },
  {
    name: SvgShapeName.Ellipse,
    label: "Ellipse",
    gameDesignSvgTemplate: "SvgEllipse",
    gamePrimitive: "Ellipse",
    turtlePrimitive: "EllipsePrimitive",
    svgLibraryStatus: "available",
    turtleStatus: "planned",
    commandExample: "brush ellipse 2 1",
  },
  {
    name: SvgShapeName.Triangle,
    label: "Triangle",
    gameDesignSvgTemplate: "SvgTriangle",
    gamePrimitive: "Triangle",
    turtlePrimitive: "TrianglePrimitive",
    svgLibraryStatus: "available",
    turtleStatus: "planned",
    commandExample: "brush triangle 8",
  },
  {
    name: SvgShapeName.Polygon,
    label: "Polygon",
    gameDesignSvgTemplate: "SvgPolygon",
    gamePrimitive: "Polygon",
    turtlePrimitive: "PolygonPrimitive",
    svgLibraryStatus: "available",
    turtleStatus: "supported",
    commandExample: "brush polygon",
  },
  {
    name: SvgShapeName.OpenPolygon,
    label: "Open polygon",
    gameDesignSvgTemplate: "SvgOpenPolygon",
    gamePrimitive: "Polygon",
    turtlePrimitive: "PolylinePrimitive",
    svgLibraryStatus: "available",
    turtleStatus: "supported",
    commandExample: "brush polyline",
  },
]);

@customElement("svg-shape-list")
export class SvgShapeList extends LitElement {
  @property({ attribute: false })
  public shapes: readonly SvgShapeListItem[] = DefaultShapes;

  @property({ type: String, attribute: "selected-shape" })
  public selectedShape: SvgShapeName = SvgShapeName.Line;

  protected override render() {
    return html`
      <section class="shape-list-shell">
        <header>
          <div>
            <h2>game-design-svg shape library</h2>
            <p>
              SVG templates exported by <code>@monorepo/game-design-svg</code>.
            </p>
          </div>
        </header>

        <div class="legend">
          <span><strong>SVG</strong>: available in game-design-svg</span>
          <span><strong>Turtle</strong>: current brush/primitive support</span>
        </div>

        <div class="shape-list" role="listbox" aria-label="game-design-svg shapes">
          ${this.shapes.map((shape) => this.renderShape(shape))}
        </div>
      </section>
    `;
  }

  private renderShape(shape: SvgShapeListItem) {
    const selected = shape.name === this.selectedShape;

    return html`
      <button
        type="button"
        class=${selected ? "shape selected" : "shape"}
        role="option"
        aria-selected=${selected ? "true" : "false"}
        @click=${() => this.selectShape(shape)}
      >
        <span class="preview" aria-hidden="true">
          ${this.renderPreview(shape)}
        </span>

        <span class="content">
          <span class="title-row">
            <strong>${shape.label}</strong>
            <span class="status svg-status">SVG ${shape.svgLibraryStatus}</span>
          </span>

          <span class="meta">
            <code>${shape.gameDesignSvgTemplate}</code>
            <span>uses</span>
            <code>${shape.gamePrimitive}</code>
          </span>

          <span class="meta">
            <span>Turtle:</span>
            <code>${shape.turtlePrimitive}</code>
          </span>

          <span
            class=${shape.turtleStatus === "supported"
              ? "status turtle-status supported"
              : "status turtle-status planned"}
          >
            Turtle ${shape.turtleStatus}
          </span>

          <span class="command">${shape.commandExample}</span>
        </span>
      </button>
    `;
  }

  private renderPreview(shape: SvgShapeListItem) {
    switch (shape.name) {
      case SvgShapeName.Line:
      case SvgShapeName.Segment:
        return svg`
          <svg viewBox="0 0 48 48">
            <line x1="8" y1="36" x2="40" y2="12"></line>
          </svg>
        `;

      case SvgShapeName.Rectangle:
        return svg`
          <svg viewBox="0 0 48 48">
            <rect x="10" y="14" width="28" height="20"></rect>
          </svg>
        `;

      case SvgShapeName.Square:
        return svg`
          <svg viewBox="0 0 48 48">
            <rect x="12" y="12" width="24" height="24"></rect>
          </svg>
        `;

      case SvgShapeName.Ellipse:
        return svg`
          <svg viewBox="0 0 48 48">
            <ellipse cx="24" cy="24" rx="16" ry="10"></ellipse>
          </svg>
        `;

      case SvgShapeName.Triangle:
        return svg`
          <svg viewBox="0 0 48 48">
            <polygon points="24,9 40,38 8,38"></polygon>
          </svg>
        `;

      case SvgShapeName.Polygon:
        return svg`
          <svg viewBox="0 0 48 48">
            <polygon points="24,8 39,19 34,38 14,38 9,19"></polygon>
          </svg>
        `;

      case SvgShapeName.OpenPolygon:
        return svg`
          <svg viewBox="0 0 48 48">
            <polyline points="8,36 16,14 28,28 40,10"></polyline>
          </svg>
        `;

      default:
        return html``;
    }
  }

  private selectShape(shape: SvgShapeListItem): void {
    this.selectedShape = shape.name;

    this.dispatchEvent(
      new CustomEvent<SvgShapeSelectedEventDetail>(SvgShapeSelectedEventName, {
        bubbles: true,
        composed: true,
        detail: {
          shape,
        },
      }),
    );
  }

  public static override styles = css`
    :host {
      display: block;
      min-width: 0;
    }

    .shape-list-shell {
      display: grid;
      gap: 12px;
    }

    header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 12px;
    }

    h2 {
      margin: 0;
      font-size: 18px;
      color: var(--text-strong);
    }

    p {
      margin: 4px 0 0;
      color: var(--text-muted);
      font-size: 13px;
    }

    .legend {
      display: grid;
      gap: 4px;
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-muted);
      background: var(--surface-2);
      font-size: 12px;
    }

    .shape-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 10px;
    }

    .shape {
      display: grid;
      grid-template-columns: 52px 1fr;
      gap: 10px;
      align-items: center;
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px;
      text-align: left;
      color: var(--text);
      background: var(--surface-2);
      cursor: pointer;
    }

    .shape:hover {
      border-color: var(--accent);
    }

    .shape.selected {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-soft);
    }

    .preview {
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--canvas-bg);
    }

    .preview svg {
      width: 36px;
      height: 36px;
      fill: rgba(37, 99, 235, 0.16);
      stroke: var(--accent);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .content {
      display: grid;
      gap: 5px;
      min-width: 0;
    }

    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    strong {
      color: var(--text-strong);
      font-size: 14px;
    }

    .status {
      width: fit-content;
      border-radius: 999px;
      padding: 2px 7px;
      font-size: 11px;
      line-height: 1.4;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    .svg-status,
    .turtle-status.supported {
      color: var(--ok);
      background: var(--ok-bg);
      border: 1px solid var(--ok-border);
    }

    .turtle-status.planned {
      color: var(--text-muted);
      background: var(--surface);
      border: 1px solid var(--border);
    }

    .meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 5px;
      color: var(--text-muted);
      font-size: 12px;
    }

    code {
      font: 11px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace;
      color: var(--text-strong);
    }

    .command {
      color: var(--text-muted);
      font: 12px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-shape-list": SvgShapeList;
  }
}