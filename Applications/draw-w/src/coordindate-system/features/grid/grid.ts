import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('grid-wc')
export class GridWC extends LitElement {
  @property({ type: Boolean }) on = true

  render() {
    return html`<div class="grid" part="grid" ?hidden=${!this.on}></div>`
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .grid {
      width: 100%;
      height: 100%;
      background-image: linear-gradient(
          to right,
          rgba(255, 255, 255, 0.06) 1px,
          transparent 1px
        ),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
      background-size: 40px 40px;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'grid-wc': GridWC
  }
}
