import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-clickable')
export class UIClickableElement extends UIElement {
  static styles = css`
    :host {
      display: block;
      cursor: pointer;
    }
    :host(:hover) {
      opacity: 0.9;
    }
  `;

  render() {
    return html`
      <div @click=${this.handleClick}>
        <slot></slot>
      </div>
    `;
  }

  private handleClick = (e: MouseEvent) => {
    this.dispatchEvent(new CustomEvent('ui-click', { detail: e, bubbles: true, composed: true }));
  };
}
