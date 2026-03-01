import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-label')
export class UILabelElement extends UIElement {
  static styles = css`
    :host {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }
  `;

  render() {
    return html`<label><slot></slot></label>`;
  }
}
