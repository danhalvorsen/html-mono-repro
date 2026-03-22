// Applications/app-core-math-colors-samples/src/Palette/PalettesPresenterUI.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IColor, INewPalette } from "@monorepo/core-math-colors";

import "./PaletteUI";

@customElement("mr-palettes")
export class PalettesPresenterUI extends LitElement {
  public static override styles = css`
    :host {
      display: grid;
      gap: 12px;
    }
  `;

  @property({ attribute: false })
  public palettes: readonly INewPalette<IColor>[] = [];

  protected override createRenderRoot() {
    return this; // no shadow (matches your style)
  }

  protected override render() {
    if (this.palettes.length === 0) return null;

    return html`
      ${this.palettes.map(
        (palette) => html`
          <mr-palette-ui
            .colors=${palette.getAll()}
            width="400"
            height="32"
          ></mr-palette-ui>
        `,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-palettes": PalettesPresenterUI;
  }
}
