import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("view-diagnostics")
export class ViewDiagnostics extends LitElement {
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
        <h2>Diagnostics</h2>
        <p>Use this view for scene and gameplay debug metrics.</p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-diagnostics": ViewDiagnostics;
  }
}

