import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('field-name-wc')
export class FieldNameWC extends LitElement {
  @property() name = ''

  render() {
    return html`<span class="fieldName" part="fieldName">${this.name}</span>`
  }

  static styles = css`
    :host {
      display: contents;
    }

    .fieldName {
      opacity: 0.75;
      font-size: 12px;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'field-name-wc': FieldNameWC
  }
}

