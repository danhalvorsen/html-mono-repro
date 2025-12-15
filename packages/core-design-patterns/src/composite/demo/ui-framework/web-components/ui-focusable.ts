import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-focusable')
export class UIFocusableElement extends UIElement {
  static styles = css`
    :host {
      display: block;
    }
    :host(:focus-within) {
      outline: 2px solid var(--ui-primary, #007bff);
      border-radius: 6px;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
