// src/RgbaInput.ts

import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import {type IColor, RgbaParser } from '@monorepo/core-math-colors'

//import { toRgbaCss } from "./Rgba";

@customElement("mr-rgba-input")
export class RgbaInput extends LitElement {

  @state()
  private _value = "";

  @state()
  private _colors: IColor[] = [];

  protected render() {
    const parsed = RgbaParser.tryParse(this._value);

    return html`
      <div>
        <input
          placeholder="rgba(255, 0, 0, 1)"
          .value=${this._value}
          @input=${this._onInput}
          @keydown=${this._onKeyDown}
        />

        <div
          style="width:40px;height:40px;background:${parsed ? parsed.toCssRgba() : "transparent"}"
        ></div>

        <button ?disabled=${!parsed} @click=${this._onAdd}>
          ADD
        </button>
      </div>

      <slot
        name="list"
        @color-remove-requested=${this._onRemove}
      ></slot>
    `;
  }

  protected updated(): void {
    const list = this._getList();

    if (list) {
      list.items = [...this._colors];
    }
  }

  private _onInput(e: Event) {
    this._value = (e.target as HTMLInputElement).value;
  }

  private _onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      this._onAdd();
    }
  }

  private _onAdd() {
    const parsed = RgbaParser.tryParse(this._value);
    if (!parsed) return;

    this._colors = [...this._colors, parsed];
    this._value = "";
  }

  private _onRemove(e: Event) {
    const index = (e as CustomEvent<number>).detail;

    this._colors = this._colors.filter((_, i) => i !== index);
  }

  private _getList(): { items: readonly IColor[] } | null {
    const slot = this.renderRoot.querySelector('slot[name="list"]') as HTMLSlotElement;
    return (slot?.assignedElements()[0] as any) ?? null;
  }
}