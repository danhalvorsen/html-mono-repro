// src/pdf-presenter.ts

import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  DEFAULT_PDF_PRESENTATION_HEIGHT,
  DEFAULT_PDF_PRESENTATION_WIDTH,
  hasPdfSource,
  normalizePdfPresenterDimension,
} from "./pdf-presenter-model.js";

@customElement("pdf-presenter")
export class PdfPresenterElement extends LitElement {
  @property({ type: String })
  public src = "";

  @property({ type: Number })
  public width = DEFAULT_PDF_PRESENTATION_WIDTH;

  @property({ type: Number })
  public height = DEFAULT_PDF_PRESENTATION_HEIGHT;

  public override render(): TemplateResult {
    const normalizedSource = this.src.trim();

    if (!hasPdfSource(normalizedSource)) {
      return html`<section class="empty">No PDF source configured.</section>`;
    }

    const width = normalizePdfPresenterDimension(
      this.width,
      DEFAULT_PDF_PRESENTATION_WIDTH,
    );
    const height = normalizePdfPresenterDimension(
      this.height,
      DEFAULT_PDF_PRESENTATION_HEIGHT,
    );

    return html`
      <section
        class="host"
        style=${`width:${width}px;height:${height}px;`}
      >
        <object
          class="viewer"
          data=${normalizedSource}
          type="application/pdf"
          aria-label="PDF document"
        >
          <p>
            PDF preview is not supported by this browser.
            <a href=${normalizedSource} target="_blank" rel="noopener noreferrer">
              Open PDF
            </a>
          </p>
        </object>
      </section>
    `;
  }

  public static override styles = css`
    :host {
      display: inline-block;
    }

    .host {
      box-sizing: border-box;
      overflow: hidden;
      border: 1px solid #ccc;
      background: #f8f8f8;
    }

    .viewer {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
    }

    .empty {
      padding: 1rem;
      border: 1px dashed #aaa;
      color: #666;
      font-family: system-ui, sans-serif;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pdf-presenter": PdfPresenterElement;
  }
}
