// ====================================================================================
// FILE: Applications/app-core-math-colors-samples/src/Gradient/NewGradientUI.ts
// ====================================================================================

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IColor, INewGradient } from "@monorepo/core-math-colors";
import "./LabelUI";
import "./PlainTriangleUI";

@customElement("gradient-ui")
export class GradientUI extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .gradient-ui {
      display: grid;
      gap: 8px;
    }

    .bar-shell {
      position: relative;
      padding-top: 12px;
    }

    .bar {
      position: relative;
      z-index: 1;
    }

    .stop-marker {
      position: absolute;
      top: 0;
      z-index: 2;
      pointer-events: none;
    }
  `;

  @property({ attribute: false })
  public gradient: INewGradient<IColor> | null = null;

  @property({ type: Number })
  public height = 42;

  @property({ type: Number, attribute: "corner-radius" })
  public cornerRadius = 9;

  protected override render() {
    return html`
      <div class="gradient-ui">
        ${this._renderLabel()}
        <div class="bar-shell">
          ${this._renderStops()}
          <div class="bar" style=${this._style()}>
            ${this._renderGradient()}
          </div>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------------

  private _renderStops() {
    if (!this.gradient) return null;

    const stops = this.gradient.getAll();
    const markerSize = 10;

    return html`
      ${stops.map(
        (stop) => html`
          <mr-plain-triangle
            class="stop-marker"
            style=${this._stopStyle(stop.position, markerSize)}
            .size=${markerSize}
            .position=${stop.position}
            fill="#0284c7"
            stroke="#043c5a"
          ></mr-plain-triangle>
        `,
      )}
    `;
  }
  
private _renderLabel() {
    if (!this.gradient) return null;

    return html`
    <div>
    <b>
        <mr-label-badge text="Name: ${this.gradient.name}" width="160" height="12" fill="#e0f2fe" stroke="#0284c7"></mr-label-badge> 
    </b>

    </div>`;
  }

  private _renderGradient() {
    if (!this.gradient) return null;
  
    const stops = this.gradient.getAll();

    const css = stops
      .map((s) => `${s.color.toCssRgba()} ${s.position * 100}%`)
      .join(", ");

    return html`
      <div
        style="
          width:100%;
          height:100%;
          background: linear-gradient(to right, ${css});
        "
      ></div>
    `;
  }

  // ----------------------------------------------------------------------------------
  // STYLE
  // ----------------------------------------------------------------------------------

  private _style(): string {
    return `
      width:100%;
      height:${this.height}px;
      border-radius:${this._radius()}px;
      overflow:hidden;
      border:1px solid rgba(17,24,39,0.2);
      box-sizing:border-box;
    `;
  }

  private _radius(): number {
    return Math.max(0, Math.min(this.cornerRadius, this.height / 2));
  }

  private _stopStyle(normalizedPosition: number, markerSize: number): string {
    const clamped = Math.max(0, Math.min(1, normalizedPosition));
    const leftPercent = clamped * 100;
    const halfSize = markerSize / 2;

    return `
      display:block;
      left:calc(${leftPercent}% - ${halfSize}px);
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "gradient-ui": GradientUI;
  }
}
