import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-rectangle')
export class UIRectangleElement extends UIElement {
  static styles = css`
    :host {
      display: block;
    }
    .boundary {
      border: 2px solid var(--ui-border-rect, #333);
      border-radius: var(--ui-radius-sm, 4px);
      padding: 12px;
    }
  `;

  render() {
    return html`
      <div class="boundary">
        <slot></slot>
      </div>
    `;
  }
}
