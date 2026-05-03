import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import "../code-editor.js";

const jsonSample = `{
  "app": "core-lit-monaco-editor-application",
  "mode": "multi-view",
  "views": ["editor", "json", "readonly"],
  "version": 1
}`;

@customElement("monaco-json-page-view")
export class MonacoJsonPageView extends LitElement {
  public static override styles = css`
    :host {
      color: #0f1a2e;
      display: block;
      min-height: 100vh;
      font-family: "Segoe UI", Tahoma, sans-serif;
      background: #e5edf9;
    }

    main {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      min-height: 100vh;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 0.8rem 1rem;
      border-bottom: 1px solid #c9d9ef;
      background: #f7fbff;
    }

    a {
      color: #0d5ab3;
      text-decoration: none;
    }

    section {
      min-height: 0;
    }

    code-editor {
      --editor-height: 100%;
      height: 100%;
    }
  `;

  public override render() {
    return html`
      <main>
        <header>
          <a href="./editor.html">Back to Editor</a>
          <div>Language: JSON</div>
        </header>

        <section>
          <code-editor language="json" theme="vs-light" .code=${jsonSample}></code-editor>
        </section>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "monaco-json-page-view": MonacoJsonPageView;
  }
}
