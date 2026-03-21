import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-input-number')
export class UIInputNumberElement extends UIElement {
  @property({ type: Number }) accessor value: number | null = null;
  @property({ type: String }) accessor placeholder = '';

  // Optional extras
  @property({ type: Number }) accessor min: number | undefined;
  @property({ type: Number }) accessor max: number | undefined;
  @property({ type: Number }) accessor step: number | undefined;

  static styles = css`
    :host {
      display: block;
    }
    input {
      width: 100%;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #aaa;
      font-size: 14px;
      box-sizing: border-box;
    }
  `;

  private onInput = (e: Event) => {
    const el = e.target as HTMLInputElement;
    this.value = el.value === '' ? null : Number(el.value);

    this.dispatchEvent(
      new CustomEvent('ui-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      })
    );
  };

  render() {
    return html`
      <input
        type="number"
        .value=${this.value !== null ? String(this.value) : ''}
        .placeholder=${this.placeholder}
        .min=${this.min !== undefined ? String(this.min) : ''}
        .max=${this.max !== undefined ? String(this.max) : ''}
        .step=${this.step !== undefined ? String(this.step) : ''}
        @input=${this.onInput}
      />
    `;
  }
}
