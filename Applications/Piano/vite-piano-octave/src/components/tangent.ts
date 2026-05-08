import { LitElement, css, html, svg, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Point } from "../types";
import { TangentMouseClickController } from "./TangentMouseClickController";
import type { LegacyTangentGeometry } from "../octave/geometry/DefaultOctaveGeometry";

type TangentTemplate = "none" | "identifier" | "debug";

type Bounds = {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
};

@customElement("piano-tangent")
export class Tangent extends LitElement {
  public static override styles = css`
    :host {
      display: inline-block;
      line-height: 0;
      box-sizing: border-box;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }
  `;

  @property({ type: String })
  public note = "";

  @property({ type: String, attribute: "tangent-id", reflect: true })
  public tangentId = "";

  @property({ type: Boolean, attribute: "is-black", reflect: true })
  public isBlack = false;

  @property({ attribute: false })
  public geometry: LegacyTangentGeometry | null = null;

  @property({ attribute: false })
  public points: Point[] = [];

  @property({ type: Boolean, attribute: false })
  public pressed = false;

  @property({ type: String, attribute: "template" })
  public template: TangentTemplate = "identifier";

  @property({ type: Boolean, attribute: "show-box" })
  public showBox = true;

  @property({ type: Number, attribute: "box-width-ratio" })
  public boxWidthRatio = 0.8;

  @property({ type: Number, attribute: "box-depth-ratio" })
  public boxDepthRatio = 0.9;

  private readonly mouseClickController = new TangentMouseClickController(this);

  protected override willUpdate(): void {
    if (this.geometry === null) {
      return;
    }

    this.tangentId = this.geometry.name;
    this.note = this.geometry.name;
    this.isBlack = this.geometry.name.includes("s");
    this.points = this.geometry.points.map(([x, y]) => [x, y] as const);
  }

  protected override render(): TemplateResult {
    if (this.points.length === 0) {
      return html``;
    }

    const bounds = this.readBounds(this.points);
    const polygonPoints = this.toSvgPolygonPoints(this.points, bounds);

    return html`
    
      <svg
        viewBox="0 0 ${bounds.width} ${bounds.height}"
        xmlns="http://www.w3.org/2000/svg"
        aria-label=${this.note}
        shape-rendering="geometricPrecision"
      >
        ${svg`
          <polygon
            points=${polygonPoints}
            fill=${this.getFillColor()}
            stroke="#000"
            stroke-width="1"
            stroke-linecap="butt"
            stroke-linejoin="miter"
            vector-effect="non-scaling-stroke"
            data-note=${this.note}
            data-tangent-id=${this.tangentId}
            data-is-black=${this.isBlack ? "1" : "0"}
          ></polygon>

          ${this.renderInnerBox(bounds)}
          ${this.renderIdentifier(bounds)}
        `}
        
      </svg>
        <svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="0"
        y="0"
        width="1"
        height="1"
        fill="none"
        stroke="red"
        stroke-width="0.05"
      ></rect>
    </svg>
    `;
  }

  private renderInnerBox(bounds: Bounds): unknown {
    if (!this.showBox) {
      return svg``;
    }

    const width = bounds.width * this.clamp01(this.boxWidthRatio);
    const height = bounds.height * this.clamp01(this.boxDepthRatio);

    const x = (bounds.width - width) / 2;
    const y = bounds.height - height;

    return svg`
      <rect
        x=${x}
        y=${y}
        width=${width}
        height=${height}
        fill="rgba(255, 0, 0, 0.08)"
        stroke="red"
        stroke-width="2"
        stroke-linejoin="miter"
        vector-effect="non-scaling-stroke"
        pointer-events="none"
        data-box-for=${this.tangentId}
      ></rect>
    `;
  }

  private renderIdentifier(bounds: Bounds): unknown {
    if (this.template === "none") {
      return svg``;
    }

    const x = bounds.width / 2;
    const y = this.isBlack ? bounds.height * 0.72 : bounds.height * 0.84;

    const fontSize = this.isBlack
      ? Math.max(5, Math.min(12, bounds.width * 0.45))
      : Math.max(7, Math.min(16, bounds.width * 0.32));

    return svg`
      ${this.template === "debug"
        ? svg`
            <circle
              cx=${x}
              cy=${y}
              r="1.5"
              fill=${this.isBlack ? "#ffffff" : "#111111"}
              pointer-events="none"
            ></circle>
          `
        : svg``}

      <text
        x=${x}
        y=${y}
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Segoe UI, system-ui, sans-serif"
        font-size=${fontSize}
        font-weight="700"
        fill=${this.isBlack ? "#ffffff" : "#111111"}
        pointer-events="none"
        data-label-for=${this.tangentId}
      >${this.tangentId}</text>
    `;
  }

  private getFillColor(): string {
    if (this.pressed) {
      return this.isBlack ? "#3b82f6" : "#93c5fd";
    }

    return this.isBlack ? "#000" : "#fff";
  }

  private toSvgPolygonPoints(points: readonly Point[], bounds: Bounds): string {
    return points
      .map(([x, y]) => `${x - bounds.minX},${bounds.maxY - y}`)
      .join(" ");
  }

  private readBounds(points: readonly Point[]): Bounds {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY)
    };
  }

  private clamp01(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(1, value));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "piano-tangent": Tangent;
  }
}