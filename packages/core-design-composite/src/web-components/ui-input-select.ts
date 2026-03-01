import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-input-select')
export class UIInputSelectElement extends UIElement {
  @property({ type: Array }) options: string[] = [];
  @property({ type: String }) value: string | null = null;

  static styles = css`
    :host {
      display: block;
    }
    select {
      width: 100%;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #aaa;
      font-size: 14px;
      box-sizing: border-box;
    }
  `;

  private onChange = (e: Event) => {
    const el = e.target as HTMLSelectElement;
    this.value = el.value;

    this.dispatchEvent(
      new CustomEvent('ui-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  };

  render() {
    return html`
      <select @change=${this.onChange}>
        ${this.options.map(
          o => html`<option value=${o} ?selected=${this.value === o}>${o}</option>`
        )}
      </select>
    `;
  }
}
