// src/RgbaList.ts

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./RgbGradientBar";
import "./RgbListItem";
import type { IColor } from '@monorepo/core-math-colors';

@customElement("mr-rgba-list")
export class RgbaList extends LitElement {
  @property({ type: Array })
  public items: readonly IColor[] = [];

  @property({ attribute: false })
  public onRemove: ((index: number) => void) | null = null;

  protected render() {
    return html`
      <mr-rgb-gradient-bar .colors=${this.items}></mr-rgb-gradient-bar>

      <ul>
        ${this.items.map((color, index) => html`
          <li>
            <mr-rgb-list-item
              .value=${color}
              .index=${index}
              .onRemove=${this.onRemove}
            ></mr-rgb-list-item>
          </li>
        `)}
      </ul>
    `;
  }
}