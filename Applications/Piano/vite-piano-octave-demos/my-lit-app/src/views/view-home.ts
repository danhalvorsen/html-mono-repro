import { LitElement, css, html, type TemplateResult } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('view-home')
export class ViewHome extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    h2 {
      margin: 0 0 10px;
    }
    p {
      margin: 0;
      color: #4b5563;
    }
  `

  protected render(): TemplateResult {
    return html`
      <h2>Home View</h2>
      <p>This is the Home view.</p>
    `
  }
}
