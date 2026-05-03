import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import "../code-editor.js";

const readonlyCode = `/**
 * Readonly Monaco view.
 * Useful for logs, generated code, or external snapshots.
 */
export const mode = "readonly";
`;

@customElement("monaco-readonly-page-view")
export class MonacoReadonlyPageView extends LitElement {
  public static override styles = css`
    :host {
      color: #d8deec;
      display: block;
      min-height: 100vh;
      font-family: "Segoe UI", Tahoma, sans-serif;
      background: #121212;
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
      border-bottom: 1px solid #313131;
      background: #1a1a1a;
    }

    a {
      color: #72b8ff;
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
          <div>Readonly: enabled</div>
        </header>

        <section>
          <code-editor language="typescript" theme="vs-dark" readonly .code=${readonlyCode}></code-editor>
        </section>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "monaco-readonly-page-view": MonacoReadonlyPageView;
  }
}
