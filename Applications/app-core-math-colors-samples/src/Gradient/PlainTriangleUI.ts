// ====================================================================================
// FILE: PlainTriangle.ts (position-aware, normalized [0..1])
// ====================================================================================

import { LitElement, svg } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("mr-plain-triangle")
export class PlainTriangleUI extends LitElement {
  @property({ type: Number })
  public size = 24;

  @property({ type: String })
  public fill = "white";

  @property({ type: String })
  public stroke = "black";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 1;

  // 🔥 normalized position [0..1]
  @property({ type: Number })
  public position = 0.5;

  protected override createRenderRoot(): this {
    return this;
  }

  protected override render() {
    const side = this.size;
    const height = (Math.sqrt(3) / 2) * side;

    return svg`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${side}"
        height="${height}"
        viewBox="0 0 ${side} ${height}"
      >
        <polygon
          points="${this._points(side, height)}"
          fill="${this.fill}"
          stroke="${this.stroke}"
          stroke-width="${this.strokeWidth}"
        ></polygon>
      </svg>
    `;
  }

  // ----------------------------------------------------------------------------------
  // POSITION
  // ----------------------------------------------------------------------------------

  public get normalizedPosition(): number {
    return PlainTriangleUI._clamp01(this.position);
  }

  public getOffset(containerWidth: number): number {
    return this.normalizedPosition * containerWidth;
  }

  // ----------------------------------------------------------------------------------
  // GEOMETRY
  // ----------------------------------------------------------------------------------

  private _points(side: number, height: number): string {
    const p1 = `0,${height}`;
    const p2 = `${side / 2},0`;
    const p3 = `${side},${height}`;

    return `${p1} ${p2} ${p3}`;
  }

  private static _clamp01(value: number): number {
    if (!Number.isFinite(value)) {
      throw new Error(`Triangle position must be finite. Received '${value}'.`);
    }

    return Math.max(0, Math.min(1, value));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-plain-triangle": PlainTriangleUI;
  }
}