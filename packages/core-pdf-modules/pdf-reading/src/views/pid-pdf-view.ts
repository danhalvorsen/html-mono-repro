import { LitElement, css, html, svg, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import type { PdfFragment } from "@monorepo/core-pdf-domain";
import { PdfEngine } from "../../../core-pdf-reader/src/engine/PdfEngine.js";

const PID_PDF_URL = "/PID.pdf" as const;
const PDF_SCALE = 1.35 as const;

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type PdfPageRenderInfo = Readonly<{
  pageNumber: number;
  width: number;
  height: number;
}>;

type PdfJsViewport = Readonly<{
  width: number;
  height: number;
}>;

type PdfJsRenderTask = Readonly<{
  promise: Promise<void>;
}>;

type PdfJsPage = Readonly<{
  getViewport(options: { scale: number }): PdfJsViewport;
  render(options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfJsViewport;
  }): PdfJsRenderTask;
}>;

type PdfJsDocument = Readonly<{
  numPages: number;
  getPage(pageNumber: number): Promise<PdfJsPage>;
}>;

@customElement("pdf-pid-view")
export class PdfPidView extends LitElement {
  private originalPdfBinary: Uint8Array | null = null;
  private visiblePdfBinary: Uint8Array | null = null;
  private pdfDocument: PdfJsDocument | null = null;

  @state()
  private pages: readonly PdfPageRenderInfo[] = [];

  @state()
  private fragments: readonly PdfFragment[] = [];

  @state()
  private isLoadingPdf = true;

  @state()
  private isFindingFragments = false;

  @state()
  private message: string | null = null;

  @state()
  private error: string | null = null;

  protected override async firstUpdated(): Promise<void> {
    await this.loadAndRenderOriginalPdf();
  }

  protected override render(): TemplateResult {
    return html`
      <section class="workspace">
        <aside class="menu" aria-label="PDF tools">
          <button
            type="button"
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.findFragments}
          >
            ${this.isFindingFragments ? "Finding fragments..." : "Find all fragments"}
          </button>

          <button
            type="button"
            class="secondary"
            ?disabled=${this.isLoadingPdf || this.isFindingFragments || this.fragments.length === 0}
            @click=${this.showOriginalPdf}
          >
            Show original PDF
          </button>

          ${this.message === null ? html`` : html`<p class="message">${this.message}</p>`}
          ${this.error === null ? html`` : html`<p class="error">${this.error}</p>`}
        </aside>

        <main class="viewer" aria-label="PID PDF viewer">
          ${this.pages.length === 0
            ? html`<p class="loading">${this.isLoadingPdf ? "Loading PID.pdf..." : "No PDF pages rendered."}</p>`
            : this.pages.map((page) => this.renderPage(page))}
        </main>
      </section>
    `;
  }

  private renderPage(page: PdfPageRenderInfo): TemplateResult {
    const pageFragments = this.fragments.filter(
      (fragment) => fragment.pageNumber === page.pageNumber,
    );

    return html`
      <section
        class="page"
        style=${`width:${page.width}px;height:${page.height}px;`}
        aria-label=${`Page ${page.pageNumber}`}
      >
        <canvas
          data-page-number=${page.pageNumber}
          width=${page.width}
          height=${page.height}
        ></canvas>

        <svg
          class="overlay"
          width=${page.width}
          height=${page.height}
          viewBox=${`0 0 ${page.width} ${page.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          ${pageFragments.map((fragment) => this.renderFragment(fragment))}
        </svg>
      </section>
    `;
  }

  private renderFragment(fragment: PdfFragment): TemplateResult {
    const box = fragment.boundingBox;

    return svg`
      <rect
        x=${box.position.x * PDF_SCALE}
        y=${box.position.y * PDF_SCALE}
        width=${box.width * PDF_SCALE}
        height=${box.height * PDF_SCALE}
        vector-effect="non-scaling-stroke"
      ></rect>
    `;
  }

  private async loadAndRenderOriginalPdf(): Promise<void> {
    this.isLoadingPdf = true;
    this.message = null;
    this.error = null;
    this.fragments = [];

    try {
      const response = await fetch(PID_PDF_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Failed to load ${PID_PDF_URL}. HTTP ${response.status}.`);
      }

      const sourceBinary = new Uint8Array(await response.arrayBuffer());

      // "Clone" model:
      // originalPdfBinary is never mutated.
      // visiblePdfBinary is the rendered document instance.
      this.originalPdfBinary = new Uint8Array(sourceBinary);
      this.visiblePdfBinary = new Uint8Array(sourceBinary);

      this.pdfDocument = await this.openPdfDocument(this.visiblePdfBinary);
      this.pages = await this.createPageRenderInfos(this.pdfDocument);

      // Important: render the page DOM first. Do not wait with isLoadingPdf=true,
      // otherwise the canvases are never in the DOM and rendering can spin forever.
      this.isLoadingPdf = false;
      this.message = `Showing original PID.pdf. Pages: ${this.pages.length}.`;

      await this.updateComplete;
      await this.renderPdfPages();
    } catch (error) {
      this.isLoadingPdf = false;
      this.error = error instanceof Error ? error.message : String(error);
    }
  }

  private async openPdfDocument(binary: Uint8Array): Promise<PdfJsDocument> {
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(binary),
      useSystemFonts: true,
    });

    return (await loadingTask.promise) as PdfJsDocument;
  }

  private async createPageRenderInfos(
    document: PdfJsDocument,
  ): Promise<readonly PdfPageRenderInfo[]> {
    const pages: PdfPageRenderInfo[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: PDF_SCALE });

      pages.push({
        pageNumber,
        width: Math.ceil(viewport.width),
        height: Math.ceil(viewport.height),
      });
    }

    return pages;
  }

  private async renderPdfPages(): Promise<void> {
    if (this.pdfDocument === null || this.pages.length === 0) {
      return;
    }

    await this.updateComplete;

    for (const pageInfo of this.pages) {
      const canvas = this.renderRoot.querySelector(
        `canvas[data-page-number="${pageInfo.pageNumber}"]`,
      );

      if (!(canvas instanceof HTMLCanvasElement)) {
        continue;
      }

      const context = canvas.getContext("2d");

      if (context === null) {
        continue;
      }

      const page = await this.pdfDocument.getPage(pageInfo.pageNumber);
      const viewport = page.getViewport({ scale: PDF_SCALE });

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
    }
  }

  private readonly findFragments = async (): Promise<void> => {
    if (this.originalPdfBinary === null || this.isFindingFragments) {
      return;
    }

    this.isFindingFragments = true;
    this.message = null;
    this.error = null;

    try {
      const sourceCopy = new Uint8Array(this.originalPdfBinary);
      this.fragments = await new PdfEngine().readFragments(sourceCopy);
      this.message = `Fragment overlay enabled. Fragments: ${this.fragments.length}.`;
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    } finally {
      this.isFindingFragments = false;
    }
  };

  private readonly showOriginalPdf = (): void => {
    this.fragments = [];
    this.message = "Showing original PID.pdf.";
    this.error = null;
  };

  public static override readonly styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }

    .workspace {
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      background: #3b3b3b;
    }

    .menu {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-width: 0;
      min-height: 0;
      padding: 0.85rem;
      border-right: 1px solid var(--line);
      background: var(--surface);
      overflow: auto;
    }

    button {
      width: 100%;
      min-height: 2.5rem;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--bg-ink);
      color: #f9f5ea;
      font: inherit;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
    }

    button.secondary {
      background: #f9f4e9;
      color: var(--text);
    }

    button:disabled {
      opacity: 0.65;
      cursor: wait;
    }

    .message,
    .error,
    .loading {
      margin: 0;
      font-size: 0.82rem;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .message,
    .loading {
      color: var(--text-muted);
    }

    .error {
      color: #9b1c1c;
    }

    .viewer {
      min-width: 0;
      min-height: 0;
      overflow: auto;
      display: grid;
      justify-items: center;
      align-content: start;
      gap: 1rem;
      padding: 1rem;
      background: #3b3b3b;
    }

    .page {
      position: relative;
      flex: 0 0 auto;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
    }

    canvas,
    .overlay {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
    }

    .overlay {
      pointer-events: none;
    }

    .overlay rect {
      fill: rgba(255, 0, 0, 0.08);
      stroke: rgba(255, 0, 0, 0.9);
      stroke-width: 1;
    }

    @media (max-width: 840px) {
      .workspace {
        grid-template-columns: 1fr;
        grid-template-rows: auto minmax(0, 1fr);
      }

      .menu {
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }
    }
  `;
}