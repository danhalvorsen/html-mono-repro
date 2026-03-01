import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-column')
export class UIColumnElement extends UIElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--ui-space-2, 8px);
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
