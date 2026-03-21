import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-toggleable')
export class UIToggleableElement extends UIElement {
   
  @property({ type: Boolean }) accessor state = false;

  static styles = css`
    :host {
      display: block;
      cursor: pointer;
    }
    .active {
      background: var(--ui-primary, #007bff);
      color: white;
      padding: 4px;
      border-radius: 4px;
    }
  `;

  private toggle = () => {
    this.state = !this.state;

    this.dispatchEvent(
      new CustomEvent('ui-change', {
        detail: { state: this.state },
        bubbles: true,
        composed: true
      })
    );
  };

  render() {
    return html`
      <div class=${this.state ? 'active' : ''} @click=${this.toggle}>
        <slot></slot>
      </div>
    `;
  }
}
