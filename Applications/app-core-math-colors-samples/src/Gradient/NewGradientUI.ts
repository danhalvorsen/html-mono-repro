// ====================================================================================
// FILE: Applications/app-core-math-colors-samples/src/Gradient/NewGradientUI.ts
// ====================================================================================

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IGradient } from "@monorepo/core-math-colors";

@customElement("mr-new-gradient-ui")
export class NewGradientUI extends LitElement {
  @property({ attribute: false })
  public gradient: IGradient | null = null;

  @property({ type: Number })
  public height = 42;

  @property({ type: Number, attribute: "corner-radius" })
  public cornerRadius = 9;

  protected override render() {
    return html`
      <div style=${this._style()}>
        ${this._renderGradient()}
      </div>
    `;
  }

  // ----------------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------------

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
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-new-gradient-ui": NewGradientUI;
  }
}