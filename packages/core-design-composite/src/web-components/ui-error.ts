import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-error')
export class UIErrorElement extends UIElement {
  @property({ type: String }) accessor message = '';

  static styles = css`
    :host {
      display: block;
      color: red;
      padding: 4px 0;
      font-size: 12px;
    }
  `;

  render() {
    return html`${this.message}`;
  }
}
