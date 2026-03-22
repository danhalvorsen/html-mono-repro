// packages/core-math-colors-samples/color-math/src/RgbGradientBar.ts

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { componentStyles } from "./componentStyles";
import {type IColor } from '@monorepo/core-math-colors'
@customElement("mr-rgb-gradient-bar")
export class RgbGradientBar extends LitElement {
  static styles = componentStyles;

  @property({ type: Array })
  public colors: readonly IColor[] = [];

  protected render() {
    return html`
      <div class="panel">
        <div
          class="gradient-bar"
          style=${`background:${this._buildGradient(this.colors)}`}
        ></div>
      </div>
    `;
  }

  private _buildGradient(colors: readonly IColor[]): string {
    if (colors.length === 0) {
      return "transparent";
    }

    if (colors.length === 1) {
      
      const only = colors[0].toCssRgba();
      return `linear-gradient(to right, ${only}, ${only})`;
    }

    const lastIndex = colors.length - 1;
    const stops = colors.map((color, index) => {
      const percentage = (index / lastIndex) * 100;
      return `${color.toCssRgba()} ${percentage}%`;
    });

    return `linear-gradient(to right, ${stops.join(", ")})`;
  }
}