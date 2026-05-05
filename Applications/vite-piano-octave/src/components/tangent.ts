import { LitElement, css, html, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Point } from "../types";
import { TangentMouseClickController } from "./TangentMouseClickController";
import type { LegacyTangentGeometry } from "../octave/geometry/DefaultOctaveGeometry";

@customElement("piano-tangent")
export class Tangent extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      line-height: 0;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }
  `;

  @property({ type: String })
  note = "";

  @property({ type: String, attribute: "tangent-id", reflect: true })
  tangentId = "";

  @property({ type: Boolean, attribute: "is-black", reflect: true })
  isBlack = false;

  @property({ attribute: false })
  geometry: LegacyTangentGeometry | null = null;

  @property({ attribute: false })
  points: Point[] = [];

  @property({ type: Boolean, attribute: false })
  pressed = false;

  private readonly mouseClickController = new TangentMouseClickController(this);

  protected willUpdate(): void {
    if (!this.geometry) return;

    this.tangentId = this.geometry.name;
    this.note = this.geometry.name;
    this.points = this.geometry.points.map(([x, y]) => [x, y] as const);
  }

  render() {
    if (this.points.length === 0) {
      return html``;
    }

    const xs = this.points.map(([x]) => x);
    const ys = this.points.map(([, y]) => y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);

    const polygonPoints = this.points
      .map(([x, y]) => `${x - minX},${maxY - y}`)
      .join(" ");
    const fillColor = this.pressed
      ? this.isBlack
        ? "#3b82f6"
        : "#93c5fd"
      : this.isBlack
        ? "#000"
        : "#fff";

    return html`
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" aria-label="${this.note}">
        ${svg`
          <polygon
            points="${polygonPoints}"
            fill="${fillColor}"
            stroke="#000"
            stroke-width="1"
            stroke-linecap="butt"
            stroke-linejoin="miter"
            vector-effect="non-scaling-stroke"
            data-note="${this.note}"
            data-tangent-id="${this.tangentId}"
          />
        `}
      </svg>
    `;
  }
}
