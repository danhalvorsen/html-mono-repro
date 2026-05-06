import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("view-settings")
export class ViewSettings extends LitElement {
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
        <h2>Settings</h2>
        <p>Settings view placeholder. Add game settings controls here.</p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-settings": ViewSettings;
  }
}

