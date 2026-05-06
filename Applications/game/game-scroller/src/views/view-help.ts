import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("view-help")
export class ViewHelp extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .panel {
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #121523;
      padding: 14px;
    }

    h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #bdc8f4;
    }
  `;

  protected render(): TemplateResult {
    return html`
      <section class="panel">
        <h2>Help</h2>
        <p>Select a menu item on the left to switch to its view.</p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-help": ViewHelp;
  }
}

