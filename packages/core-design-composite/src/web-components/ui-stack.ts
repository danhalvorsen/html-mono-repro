import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-stack')
export class UIStackElement extends UIElement {
  static styles = css`
    :host {
      display: grid;
      position: relative;
    }
    ::slotted(*) {
      grid-area: 1 / 1;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
