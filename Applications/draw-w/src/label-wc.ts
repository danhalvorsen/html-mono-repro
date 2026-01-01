import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { ValueInputDetail } from './number-input-wc'
import './web components/field/field-name-wc'
import './number-input-wc'

export type LabelValueInputDetail = Readonly<{
  name: string
  value: number
}>

@customElement('label-wc')
export class LabelWC extends LitElement {
  @property() name = 'x'
  @property({ type: Number }) value = 0
  @property() step = 'any'

  render() {
    return html`
      <label class="field" part="field">
        <field-name-wc .name=${this.name}></field-name-wc>
        <number-input-wc
          .value=${this.value}
          .step=${this.step}
          @value-input=${this.onValueInput}
        ></number-input-wc>
      </label>
    `
  }

  private onValueInput = (e: CustomEvent<ValueInputDetail>) => {
    e.stopPropagation()
    this.dispatchEvent(
      new CustomEvent<LabelValueInputDetail>('value-input', {
        detail: { name: this.name, value: e.detail.value },
        bubbles: true,
        composed: true,
      }),
    )
  }

  static styles = css`
    :host {
      display: block;
    }

    .field {
      display: grid;
      grid-template-columns: 14px 1fr;
      align-items: center;
      gap: 6px;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'label-wc': LabelWC
  }
}

