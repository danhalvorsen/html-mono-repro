// src/pdf-viewer-view.ts

import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import "./core-pdf-reader-component.js";

@customElement("pdf-viewer-view")
export class PdfViewerView extends LitElement {
  public static readonly styles = css`
    :host {
      display: block;
      padding: 2rem;
    }
  `;

  protected override render() {
    return html`
      <section>
        <h1>PDF Viewer</h1>
        <core-pdf-reader-component></core-pdf-reader-component>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pdf-viewer-view": PdfViewerView;
  }
}