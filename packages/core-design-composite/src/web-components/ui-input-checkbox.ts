import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-input-checkbox')
export class UIInputCheckboxElement extends UIElement {
  @property({ type: Boolean }) checked = false;
  @property({ type: String }) label = '';

  static styles = css`
    :host {
      display: block;
    }
    label {
      display: flex;
      gap: 8px;
      align-items: center;
      cursor: pointer;
    }
  `;

  private onToggle = (e: Event) => {
    const el = e.target as HTMLInputElement;
    this.checked = el.checked;

    this.dispatchEvent(
      new CustomEvent('ui-change', {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      })
    );
  };

  render() {
    return html`
      <label>
        <input type="checkbox" .checked=${this.checked} @change=${this.onToggle} />
        <span>${this.label}</span>
      </label>
    `;
  }
}
