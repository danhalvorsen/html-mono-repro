// Applications/app-core-math-colors-samples/src/PaletteUI.ts

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import type { IColor } from "@monorepo/core-math-colors";

@customElement("mr-palette-ui")
export class PaletteUI extends LitElement {
  @property({ type: Array })
  public colors: readonly IColor[] = [];

  @property({ type: Number })
  public width = 320;

  @property({ type: Number })
  public height = 32;

  protected override createRenderRoot() {
    return this;
  }

  protected override render() {
    if (this.colors.length === 0) return null;

    return html`
      <div
        class="palette"
        style=${styleMap({
          width: `${this.width}px`,
          height: `${this.height}px`,
        })}
      >
        ${this.colors.map((color) => html`
          <div
            class="sample"
            style=${styleMap({
              backgroundColor: color.toCssRgba(),
            })}
          ></div>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-palette-ui": PaletteUI;
  }
}
