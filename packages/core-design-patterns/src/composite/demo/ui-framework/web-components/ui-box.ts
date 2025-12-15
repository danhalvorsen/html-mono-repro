import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-box')
export class UIBoxElement extends UIElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      border-radius: 8px;
      background: var(--ui-bg-surface, #fff);
      box-shadow: var(--ui-shadow-1, 0 1px 3px rgba(0,0,0,0.1));
      border: 1px solid var(--ui-border-light, #ddd);
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
