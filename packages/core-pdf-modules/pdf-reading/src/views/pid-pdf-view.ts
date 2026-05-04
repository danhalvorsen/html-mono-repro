import { LitElement, css, html, svg, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import type { PdfFragment } from "@monorepo/core-pdf-domain";
import { PdfEngine } from "../../../core-pdf-reader/src/engine/PdfEngine.js";

const PID_PDF_URL = "/PID.pdf" as const;
const PDF_SCALE = 1.35 as const;

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type LayerMode =
  | "original"
  | "text"
  | "rectangle"
  | "image"
  | "all-fragments"
  | "all-layers";

type OverlayFragmentKind =
  | "text"
  | "rectangle"
  | "image"
  | "unknown";

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
  private pdfDocument: PdfJsDocument | null = null;

  @state()
  private pages: readonly PdfPageRenderInfo[] = [];

  @state()
  private fragments: readonly PdfFragment[] = [];

  @state()
  private hasLoadedFragments = false;

  @state()
  private layerMode: LayerMode = "original";

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
            class=${this.layerMode === "original" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showOriginalLayer}
          >
            Show PID.pdf
          </button>

          <button
            type="button"
            class=${this.layerMode === "text" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showTextFragments}
          >
            Show text fragments
          </button>

          <button
            type="button"
            class=${this.layerMode === "rectangle" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showRectangleFragments}
          >
            Show rectangles
          </button>

          <button
            type="button"
            class=${this.layerMode === "image" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showImageFragments}
          >
            Show image fragments
          </button>

          <button
            type="button"
            class=${this.layerMode === "all-fragments" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showAllFragments}
          >
            Show all fragments
          </button>

          <button
            type="button"
            class=${this.layerMode === "all-layers" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showAllLayers}
          >
            Show all layers
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
    const pageFragments = this.getVisibleFragments(page.pageNumber);

    return html`
      <section
        class=${`page mode-${this.layerMode}`}
        style=${`width:${page.width}px;height:${page.height}px;`}
        aria-label=${`Page ${page.pageNumber}`}
      >
        <canvas
          class="original-layer"
          data-page-number=${page.pageNumber}
          width=${page.width}
          height=${page.height}
        ></canvas>

        <svg
          class="fragment-layer"
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
        class=${this.resolveFragmentCssClass(fragment)}
        x=${box.position.x * PDF_SCALE}
        y=${this.resolveFragmentOverlayY(fragment) * PDF_SCALE}
        width=${box.width * PDF_SCALE}
        height=${box.height * PDF_SCALE}
        vector-effect="non-scaling-stroke"
      ></rect>
    `;
  }

  private getVisibleFragments(pageNumber: number): readonly PdfFragment[] {
    if (this.layerMode === "original") {
      return [];
    }

    return this.fragments.filter((fragment) =>
      fragment.pageNumber === pageNumber &&
      this.isFragmentVisibleInCurrentMode(fragment),
    );
  }

  private isFragmentVisibleInCurrentMode(fragment: PdfFragment): boolean {
    const kind = this.resolveOverlayFragmentKind(fragment);

    switch (this.layerMode) {
      case "text":
        return kind === "text";

      case "rectangle":
        return kind === "rectangle";

      case "image":
        return kind === "image";

      case "all-fragments":
      case "all-layers":
        return true;

      case "original":
        return false;
    }
  }

  private resolveFragmentCssClass(fragment: PdfFragment): string {
    switch (this.resolveOverlayFragmentKind(fragment)) {
      case "text":
        return "fragment fragment-text";

      case "rectangle":
        return "fragment fragment-rectangle";

      case "image":
        return "fragment fragment-image";

      case "unknown":
        return "fragment fragment-unknown";
    }
  }

  private resolveFragmentOverlayY(fragment: PdfFragment): number {
    const box = fragment.boundingBox;

    if (this.resolveOverlayFragmentKind(fragment) === "text") {
      return Math.max(0, box.position.y - box.height);
    }

    return box.position.y;
  }

  private async loadAndRenderOriginalPdf(): Promise<void> {
    this.isLoadingPdf = true;
    this.layerMode = "original";
    this.message = null;
    this.error = null;
    this.fragments = [];
    this.hasLoadedFragments = false;

    try {
      const response = await fetch(PID_PDF_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Failed to load ${PID_PDF_URL}. HTTP ${response.status}.`);
      }

      const binary = new Uint8Array(await response.arrayBuffer());

      this.originalPdfBinary = new Uint8Array(binary);
      this.pdfDocument = await this.openPdfDocument(new Uint8Array(binary));
      this.pages = await this.createPageRenderInfos(this.pdfDocument);

      this.isLoadingPdf = false;
      this.message = `Showing PID.pdf. Pages: ${this.pages.length}.`;

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

  private readonly showOriginalLayer = (): void => {
    this.layerMode = "original";
    this.message = "Showing PID.pdf.";
    this.error = null;
  };

  private readonly showTextFragments = async (): Promise<void> => {
    await this.showFragmentLayer("text", "text fragments");
  };

  private readonly showRectangleFragments = async (): Promise<void> => {
    await this.showFragmentLayer("rectangle", "rectangle fragments");
  };

  private readonly showImageFragments = async (): Promise<void> => {
    await this.showFragmentLayer("image", "image fragments");
  };

  private readonly showAllFragments = async (): Promise<void> => {
    await this.showFragmentLayer("all-fragments", "all fragments");
  };

  private readonly showAllLayers = async (): Promise<void> => {
    await this.showFragmentLayer("all-layers", "all layers");
  };

  private async showFragmentLayer(
    mode: Exclude<LayerMode, "original">,
    label: string,
  ): Promise<void> {
    try {
      await this.ensureFragments();

      this.layerMode = mode;
      this.error = null;

      const visibleCount = this.countVisibleFragments(mode);
      this.message =
        `Showing ${label}. Visible: ${visibleCount}. ` +
        `Text: ${this.countKind("text")}. ` +
        `Rectangles: ${this.countKind("rectangle")}. ` +
        `Images: ${this.countKind("image")}. ` +
        `Unknown: ${this.countKind("unknown")}. ` +
        `Total: ${this.fragments.length}.`;
    } catch {
      // ensureFragments has already populated this.error.
    }
  }

  private async ensureFragments(): Promise<void> {
    if (this.hasLoadedFragments || this.originalPdfBinary === null) {
      return;
    }

    if (this.isFindingFragments) {
      return;
    }

    this.isFindingFragments = true;
    this.message = "Finding fragments...";
    this.error = null;

    try {
      const sourceCopy = new Uint8Array(this.originalPdfBinary);

      // Important: store ALL fragment kinds.
      // Do not filter image fragments here, otherwise "Show image fragments" has nothing to render.
      this.fragments = await new PdfEngine().readFragments(sourceCopy);
      this.hasLoadedFragments = true;
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.isFindingFragments = false;
    }
  }

  private countVisibleFragments(mode: Exclude<LayerMode, "original">): number {
    return this.fragments.filter((fragment) => {
      const kind = this.resolveOverlayFragmentKind(fragment);

      switch (mode) {
        case "text":
          return kind === "text";

        case "rectangle":
          return kind === "rectangle";

        case "image":
          return kind === "image";

        case "all-fragments":
        case "all-layers":
          return true;
      }
    }).length;
  }

  private countKind(kind: OverlayFragmentKind): number {
    return this.fragments.filter((fragment) =>
      this.resolveOverlayFragmentKind(fragment) === kind,
    ).length;
  }

  private resolveOverlayFragmentKind(fragment: PdfFragment): OverlayFragmentKind {
    const rawKind = String(fragment.kind).trim().toLowerCase();

    if (rawKind === "text" || rawKind.endsWith(".text") || rawKind.includes("text")) {
      return "text";
    }

    if (
      rawKind === "rectangle" ||
      rawKind.endsWith(".rectangle") ||
      rawKind.includes("rectangle")
    ) {
      return "rectangle";
    }

    if (rawKind === "image" || rawKind.endsWith(".image") || rawKind.includes("image")) {
      return "image";
    }

    return "unknown";
  }

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
      background: #f9f4e9;
      color: var(--text);
      font: inherit;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
    }

    button.active {
      background: var(--bg-ink);
      color: #f9f5ea;
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

    .original-layer,
    .fragment-layer {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
    }

    .fragment-layer {
      pointer-events: none;
    }

    .mode-text .original-layer,
    .mode-rectangle .original-layer,
    .mode-all-fragments .original-layer {
      visibility: hidden;
    }

    .mode-original .fragment-layer {
      visibility: hidden;
    }

    .mode-image .original-layer,
    .mode-image .fragment-layer,
    .mode-all-layers .original-layer,
    .mode-all-layers .fragment-layer {
      visibility: visible;
    }

    .fragment-layer rect.fragment {
      stroke-width: 1;
    }

    .fragment-layer rect.fragment-text {
      fill: rgba(30, 144, 255, 0.12);
      stroke: rgba(30, 144, 255, 0.95);
    }

    .fragment-layer rect.fragment-rectangle {
      fill: rgba(34, 197, 94, 0.12);
      stroke: rgba(22, 163, 74, 0.95);
    }

    .fragment-layer rect.fragment-image {
      fill: rgba(168, 85, 247, 0.35);
      stroke: rgba(147, 51, 234, 1);
      stroke-width: 2;
      stroke-dasharray: 6 4;
    }

    .fragment-layer rect.fragment-unknown {
      fill: rgba(255, 0, 0, 0.10);
      stroke: rgba(255, 0, 0, 0.85);
      stroke-dasharray: 2 2;
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