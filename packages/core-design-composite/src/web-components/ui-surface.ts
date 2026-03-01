import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-surface')
export class UISurfaceElement extends UIElement {
  static styles = css`
    :host {
      display: block;
      padding: 20px;
      background: var(--ui-bg-elevated, #fcfcfc);
      border-radius: var(--ui-radius-md, 8px);
      box-shadow: var(--ui-shadow-2, 0 3px 8px rgba(0,0,0,0.12));
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
