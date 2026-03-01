import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-spacer')
export class UISpacerElement extends UIElement {
  @property({ type: Number }) size = 8;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
  `;

  render() {
    return html`
      <div style="height: ${this.size}px;"></div>
    `;
  }
}
