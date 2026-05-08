import { LitElement, css, html, svg, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Point } from "../types";
import { TangentMouseClickController } from "./TangentMouseClickController";
import type { LegacyTangentGeometry } from "../octave/geometry/DefaultOctaveGeometry";
import type { TangentSkinTemplate } from "./tangent-skin";
import {
  DefaultTangentUpperLineSegmentReader,
  type TangentUpperLineSegment
} from "../application/TangentUpperLineSegment";
import "./tangent-skin";

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
      display: block;
      width: 100%;
      height: 100%;
      line-height: 0;
      box-sizing: border-box;
    }

    .tangent {
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    .key-svg {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
      touch-action: none;
    }

    tangent-skin {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: block;
      pointer-events: none;
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

  @property({ type: Boolean, attribute: "show-skin" })
  public showSkin = true;

  @property({ type: String, attribute: "template" })
  public template: TangentSkinTemplate = "identifier";

  @property({ type: Boolean, attribute: "show-box" })
  public showBox = true;

  @property({ type: Number, attribute: "skin-margin-ratio" })
  public skinMarginRatio = 0.1;

  private readonly mouseClickController = new TangentMouseClickController(this);
  private readonly upperLineSegmentReader = new DefaultTangentUpperLineSegmentReader();

  public getUpperLineSegment(): TangentUpperLineSegment | null {
    return this.upperLineSegmentReader.read(this.getSourcePoints());
  }

  public getLength(): number {
    return this.getUpperLineSegment()?.length ?? 0;
  }

  protected override willUpdate(): void {
    if (this.geometry === null) {
      return;
    }

    const previousNote = this.note;
    const nextNote = this.geometry.name;

    if (this.tangentId.length === 0 || this.tangentId === previousNote) {
      this.tangentId = nextNote;
    }

    this.note = nextNote;
    this.isBlack = nextNote.includes("s");
    this.points = this.geometry.points.map(([x, y]) => [x, y] as const);
  }

  protected override render(): TemplateResult {
    if (this.points.length === 0) {
      return html``;
    }

    const bounds = this.readBounds(this.points);
    const polygonPoints = this.toSvgPolygonPoints(this.points, bounds);

    return html`
      <div class="tangent">
        <svg
          class="key-svg"
          viewBox="0 0 ${bounds.width} ${bounds.height}"
          xmlns="http://www.w3.org/2000/svg"
          aria-label=${this.note}
          shape-rendering="geometricPrecision"
          preserveAspectRatio="none"
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
          `}
        </svg>

        <tangent-skin
          .visible=${this.showSkin}
          .template=${this.template}
          .tangentId=${this.tangentId}
          .keyType=${this.isBlack ? "black" : "white"}
          .showBox=${this.showBox}
          .skinMarginRatio=${this.skinMarginRatio}
        ></tangent-skin>
      </div>
    `;
  }

  private getSourcePoints(): readonly Point[] {
    return (this.geometry?.points as readonly Point[] | undefined) ?? this.points;
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
}

declare global {
  interface HTMLElementTagNameMap {
    "piano-tangent": Tangent;
  }
}