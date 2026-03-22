// packages/core-math-colors-samples/color-math/src/RgbListItem.ts

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { componentStyles } from "./componentStyles";
import type { IColor } from "@monorepo/core-math-colors";

@customElement("mr-rgb-list-item")
export class RgbListItem extends LitElement {
  static styles = componentStyles;

  @property({ type: Object })
  public value!: IColor;

  @property({ type: Number })
  public index = -1;

  protected render() {
    if (!this.value) {
      return html``;
    }

    return html`
      <div class="item">
        <div class="swatch">
          <div
            class="swatch-fill"
            style=${styleMap({ backgroundColor: this.value.toCssRgba() })}
          ></div>
        </div>

        <div class="text">${this.value.toCssRgba()}</div>

        <button class="icon-button" @click=${this._onDelete} aria-label="Delete color">
          ✕
        </button>
      </div>
    `;
  }

  private _onDelete(): void {
    this.dispatchEvent(new CustomEvent<number>("color-remove-requested", {
      detail: this.index,
      bubbles: true,
      composed: true
    }));
  }
}