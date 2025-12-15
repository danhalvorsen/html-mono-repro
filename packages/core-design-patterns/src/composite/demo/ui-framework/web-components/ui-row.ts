import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-row')
export class UIRowElement extends UIElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      gap: var(--ui-space-2, 8px);
      align-items: center;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
