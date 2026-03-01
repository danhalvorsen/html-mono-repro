import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';
 
@customElement('ui-input-text')
export class UIInputTextElement extends UIElement {
 
  @property({ type: String }) accessor value: string = '';
  @property({ type: String }) accessor placeholder: string = '';

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
    const el = e.target as { value: string } | null;
    this.value = el ? el.value : '';

  };

  render() {
    return html`
      <input
        type="text"
        .value=${this.value}
        .placeholder=${this.placeholder}
        @input=${this.onInput}
      />
    `;
  }
}
