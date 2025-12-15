import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-validatable')
export class UIValidatableElement extends UIElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
