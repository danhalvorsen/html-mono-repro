// src/core-pdf-reader-component.ts

import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { PdfFragment } from "@monorepo/core-pdf-domain";
import {
  InMemoryPdfBinarySource,
  PdfEngine,
  PdfReader,
} from "@monorepo/core-pdf-reader";

@customElement("core-pdf-reader-component")
export class CorePdfReaderComponent extends LitElement {
  public static readonly styles = css`
    :host {
      display: block;
      padding: 1rem;
    }

    .fragment {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #ccc;
      padding-bottom: 1rem;
    }

    pre {
      background: #f8f8f8;
      padding: 0.5rem;
      overflow: auto;
    }

    .error {
      color: #b00020;
    }
  `;

  @state()
  private accessor fragments: readonly PdfFragment[] = [];

  @state()
  private accessor error: string | null = null;

  protected override async firstUpdated(): Promise<void> {
    try {
      const response = await fetch("/sample.pdf");

      if (!response.ok) {
        throw new Error(`Failed to load PDF. Status: ${response.status}`);
      }

      const binary = new Uint8Array(await response.arrayBuffer());
      const source = new InMemoryPdfBinarySource("sample.pdf", binary);
      const reader = new PdfReader(new PdfEngine());

      this.fragments = await reader.readFragments(source);
    } catch (error: unknown) {
      this.error = error instanceof Error ? error.message : String(error);
    }
  }

  protected override render() {
    if (this.error !== null) {
      return html`<div class="error">Error: ${this.error}</div>`;
    }

    if (this.fragments.length === 0) {
      return html`<div>Loading PDF fragments...</div>`;
    }

    return html`
      <section>
        <h2>PDF Fragments</h2>

        ${this.fragments.map(
          (fragment) => html`
            <article class="fragment">
              <div><strong>Kind:</strong> ${fragment.kind}</div>
              <div><strong>Page:</strong> ${fragment.pageNumber}</div>
              <pre>${"text" in fragment ? fragment.text : JSON.stringify(fragment, null, 2)}</pre>
            </article>
          `,
        )}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "core-pdf-reader-component": CorePdfReaderComponent;
  }
}