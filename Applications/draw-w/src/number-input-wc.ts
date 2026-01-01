import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export type ValueInputDetail = Readonly<{ value: number }>

@customElement('number-input-wc')
export class NumberInputWC extends LitElement {
  @property({ type: Number }) value = 0
  @property() step = 'any'

  render() {
    return html`
      <input
        class="num"
        part="input"
        type="number"
        .value=${String(this.value)}
        step=${this.step}
        @input=${this.onInput}
      />
    `
  }

  private onInput = (e: InputEvent) => {
    const input = e.target as HTMLInputElement | null
    if (!input) return
    const value = Number(input.value)
    const safeValue = Number.isFinite(value) ? value : 0

    this.dispatchEvent(
      new CustomEvent<ValueInputDetail>('value-input', {
        detail: { value: safeValue },
        bubbles: true,
        composed: true,
      }),
    )
  }

  static styles = css`
    :host {
      display: contents;
    }

    input.num {
      width: 100%;
      min-width: 90px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(0, 0, 0, 0.25);
      color: rgba(255, 255, 255, 0.9);
      padding: 0.45em 0.6em;
      font: inherit;
      outline: none;
    }

    input.num:focus {
      border-color: rgba(86, 214, 255, 0.8);
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'number-input-wc': NumberInputWC
  }
}

