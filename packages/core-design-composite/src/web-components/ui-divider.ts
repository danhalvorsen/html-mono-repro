import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-divider')
export class UIDividerElement extends UIElement {
  @property({ type: String })
  direction: 'horizontal' | 'vertical' = 'horizontal';

  static styles = css`
    :host {
      display: block;
      margin: 4px 0;
    }
    .horizontal {
      height: 1px;
      width: 100%;
      background: var(--ui-border-light, #ddd);
    }
    .vertical {
      width: 1px;
      height: 100%;
      background: var(--ui-border-light, #ddd);
    }
  `;

  render() {
    return html`
      <div class=${this.direction}></div>
    `;
  }
}
