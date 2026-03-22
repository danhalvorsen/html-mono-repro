import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { componentStyles } from "./componentStyles";

import "./RgbaInput";
import "./RgbaList";
import "./RgbListItem";
import "./RgbGradientBar";
import "./Gradient/LabelUI";
import "./Gradient/GradientUI";
import "./GradientRendererUI";
import "./Gradient/GradientPresenterUI";
import "./PalettesPresenterUI";
import type { IColor, INewPalette } from "@monorepo/core-math-colors";

import { PaletteMapper } from "./PaletteMapper";
import palettesJson from "./Palettes.json";
@customElement("mr-app")
export class App extends LitElement {
  public static override styles = componentStyles;
 private _palettes: readonly INewPalette<IColor>[] = [];
 private _paletteMapper: PaletteMapper;
 
  constructor()  {
    super();
    this._paletteMapper = new PaletteMapper();
    this._palettes = palettesJson.map(p => this._paletteMapper.fromJson(p));
  }

  protected override render() {
    return html`
      <div class="app-shell">
        <mr-rgba-input>
          <mr-rgba-list slot="list"></mr-rgba-list>
        </mr-rgba-input>
        <mr-palettes .palettes=${this._palettes}></mr-palettes>
        <gradients-presenter-ui></gradients-presenter-ui>
      
      </div>
    `;
  }
}
