// Applications/app-core-math-colors-samples/src/Gradient/NewGradientUI.ts

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IGradient } from "@monorepo/core-math-colors";

@customElement("mr-new-gradient-ui")
export class NewGradientUI extends LitElement {
  @property({ attribute: false })
  public gradient: IGradient | null = null;

  @property({ type: Number }) public height = 42;
  @property({ type: Number, attribute: "corner-radius" }) public cornerRadius = 9;

  protected override render() {
    return html`
      <div style=${this._style()}>
        ${this._renderChildren()}
      </div>
    `;
  }

  private _renderChildren() {
    // inject gradient into direct child if it supports it
    const child = this.firstElementChild as unknown;

    if (this._isGradientAware(child)) {
      child.gradient = this.gradient;
    }

    return html`<slot></slot>`;
  }

  private _isGradientAware(
    value: unknown,
  ): value is { gradient: IGradient | null } {
    return (
      typeof value === "object" &&
      value !== null &&
      "gradient" in value
    );
  }

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