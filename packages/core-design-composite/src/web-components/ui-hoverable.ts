import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-hoverable')
export class UIHoverableElement extends UIElement {
  static styles = css`
    :host {
      display: block;
    }
    :host(:hover) {
      filter: brightness(1.1);
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
