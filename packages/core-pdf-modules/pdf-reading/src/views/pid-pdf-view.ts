import { LitElement, css, html, svg, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import type { PdfFragment } from "@monorepo/core-pdf-domain";
import {
  DbscanPdfFragmentClusterer,
  type IPdfFragmentDistance,
} from "@monorepo/core-pdf-dbscan";
import { PdfEngine } from "../../../core-pdf-reader/src/engine/PdfEngine.js";

const PID_PDF_URL = "/PID.pdf" as const;
const PDF_SCALE = 1.35 as const;

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const centerDistance: IPdfFragmentDistance<PdfFragment> = {
  measure(left, right) {
    const leftCx = left.boundingBox.position.x + left.boundingBox.width / 2;
    const leftCy = left.boundingBox.position.y + left.boundingBox.height / 2;
    const rightCx = right.boundingBox.position.x + right.boundingBox.width / 2;
    const rightCy = right.boundingBox.position.y + right.boundingBox.height / 2;
    return Math.hypot(leftCx - rightCx, leftCy - rightCy);
  },
};

type LayerMode =
  | "original"
  | "text"
  | "path"
  | "rectangle"
  | "image"
  | "all-fragments"
  | "all-layers"
  | "clusters"
  | "find-by-text"
  | "dbscan-1"
  | "dbscan-2"
  | "dbscan-3"
  | "dbscan-4"
  | "dbscan-ai";

type OverlayFragmentKind =
  | "text"
  | "rectangle"
  | "image"
  | "path"
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

type ClusterReport = Readonly<{
  modeLabel: string;
  eps: number;
  minPts: number;
  clusterCount: number;
  clusteredCount: number;
  noiseCount: number;
  candidateCount: number;
  excludedCount: number;
  totalCount: number;
  generatedAt: string;
}>;

type ClusterOverlayBox = Readonly<{
  clusterIndex: number;
  pageNumber: number;
  itemCount: number;
  boundingBox: PdfFragment["boundingBox"];
}>;

@customElement("pdf-pid-view")
export class PdfPidView extends LitElement {
  private static readonly DBSCAN_CONFIGS = {
    "dbscan-1": { eps: 1.5, minPts: 4, label: "DBSCAN #1 (tight)" },
    "dbscan-2": { eps: 3.0, minPts: 4, label: "DBSCAN #2" },
    "dbscan-3": { eps: 6.0, minPts: 5, label: "DBSCAN #3" },
    "dbscan-4": { eps: 10.0, minPts: 6, label: "DBSCAN #4 (loose)" },
    "dbscan-ai": { eps: 4.5, minPts: 5, label: "SC-SCAN AI suggested" },
  } as const;

  private originalPdfBinary: Uint8Array | null = null;
  private pdfDocument: PdfJsDocument | null = null;
  private readonly dbscanClusterer = new DbscanPdfFragmentClusterer({
    distance: centerDistance,
  });
  private dbscanClusterIndexByFragment = new Map<PdfFragment, number>();
  private dbscanClusterCount = 0;
  private dbscanNoiseCount = 0;

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

  @state()
  private isProcessing = false;

  @state()
  private processingLabel: string | null = null;

  @state()
  private lastProcessingNote: string | null = null;

  @state()
  private clusterReport: ClusterReport | null = null;

  @state()
  private clusterBoxes: readonly ClusterOverlayBox[] = [];

  @state()
  private clusterEps = 4.5;

  @state()
  private clusterMinPts = 5;

  @state()
  private clusterTextQuery = "";

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
            class=${this.layerMode === "path" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showPathFragments}
          >
            Show path fragments
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

          <button
            type="button"
            class=${this.layerMode === "clusters" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showClusters}
          >
            Show Clusters
          </button>

          <section class="cluster-controls" aria-label="Find cluster by text">
            <label for="cluster-text-query">
              Find Cluster By Text
            </label>
            <input
              id="cluster-text-query"
              type="text"
              placeholder='e.g. "41-"'
              .value=${this.clusterTextQuery}
              ?disabled=${this.isLoadingPdf || this.isFindingFragments}
              @input=${this.handleClusterTextQueryInput}
            />
            <button
              type="button"
              class=${this.layerMode === "find-by-text" ? "active" : ""}
              ?disabled=${this.isLoadingPdf || this.isFindingFragments}
              @click=${this.showClustersByText}
            >
              Find Cluster by text
            </button>
          </section>

          <section class="cluster-controls" aria-label="DBSCAN fine tuning">
            <label for="cluster-eps">
              eps: ${this.clusterEps.toFixed(1)}
            </label>
            <input
              id="cluster-eps"
              type="range"
              min="0.5"
              max="50"
              step="0.1"
              .value=${String(this.clusterEps)}
              ?disabled=${this.isLoadingPdf || this.isFindingFragments}
              @input=${this.handleClusterEpsInput}
            />

            <label for="cluster-minpts">
              minPts: ${this.clusterMinPts}
            </label>
            <input
              id="cluster-minpts"
              type="range"
              min="1"
              max="20"
              step="1"
              .value=${String(this.clusterMinPts)}
              ?disabled=${this.isLoadingPdf || this.isFindingFragments}
              @input=${this.handleClusterMinPtsInput}
            />
          </section>

          ${this.isProcessing
            ? html`
              <div class="processing-indicator" role="status" aria-live="polite">
                <span class="spinner" aria-hidden="true"></span>
                <span>${this.processingLabel ?? "Processing..."}</span>
              </div>
            `
            : html``}
          ${this.lastProcessingNote === null
            ? html``
            : html`<p class="processing-note">${this.lastProcessingNote}</p>`}
          ${this.clusterReport === null
            ? html``
            : html`
              <section class="cluster-report" aria-label="Cluster report">
                <p><strong>Cluster Report</strong></p>
                <p>Mode: ${this.clusterReport.modeLabel}</p>
                <p>eps: ${this.clusterReport.eps.toFixed(1)}, minPts: ${this.clusterReport.minPts}</p>
                <p>Clusters: ${this.clusterReport.clusterCount}</p>
                <p>Clustered fragments: ${this.clusterReport.clusteredCount}</p>
                <p>Noise: ${this.clusterReport.noiseCount}</p>
                <p>Candidates: ${this.clusterReport.candidateCount}</p>
                <p>Excluded: ${this.clusterReport.excludedCount}</p>
                <p>Total: ${this.clusterReport.totalCount}</p>
                <p>Generated: ${this.clusterReport.generatedAt}</p>
              </section>
            `}

          <button
            type="button"
            class=${this.layerMode === "dbscan-1" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showDbscan1}
          >
            DBSCAN #1
          </button>

          <button
            type="button"
            class=${this.layerMode === "dbscan-2" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showDbscan2}
          >
            DBSCAN #2
          </button>

          <button
            type="button"
            class=${this.layerMode === "dbscan-3" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showDbscan3}
          >
            DBSCAN #3
          </button>

          <button
            type="button"
            class=${this.layerMode === "dbscan-4" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showDbscan4}
          >
            DBSCAN #4
          </button>

          <button
            type="button"
            class=${this.layerMode === "dbscan-ai" ? "active" : ""}
            ?disabled=${this.isLoadingPdf || this.isFindingFragments}
            @click=${this.showDbscanAi}
          >
            SC-SCAN AI suggested
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
    const pageClusterBoxes = this.getClusterBoxes(page.pageNumber);

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
          ${pageClusterBoxes.map((box) => this.renderClusterBox(box))}
          ${pageFragments.map((fragment) => this.renderFragment(fragment))}
        </svg>
      </section>
    `;
  }

  private renderClusterBox(box: ClusterOverlayBox): TemplateResult {
    const hue = (120 + box.clusterIndex * 41) % 360;
    const stroke = `hsla(${hue}, 92%, 34%, 0.9)`;
    const fill = `hsla(${hue}, 92%, 45%, 0.03)`;

    return svg`
      <rect
        class="cluster-box"
        x=${box.boundingBox.position.x * PDF_SCALE}
        y=${box.boundingBox.position.y * PDF_SCALE}
        width=${box.boundingBox.width * PDF_SCALE}
        height=${box.boundingBox.height * PDF_SCALE}
        style=${`fill:${fill};stroke:${stroke};`}
        vector-effect="non-scaling-stroke"
      ></rect>
    `;
  }

  private renderFragment(fragment: PdfFragment): TemplateResult {
    const box = fragment.boundingBox;
    const clusterStyle = this.getDbscanStrokeStyle(fragment);
    const clusterId = this.dbscanClusterIndexByFragment.get(fragment);

    return svg`
      <rect
        class=${this.resolveFragmentCssClass(fragment)}
        x=${box.position.x * PDF_SCALE}
        y=${this.resolveFragmentOverlayY(fragment) * PDF_SCALE}
        width=${box.width * PDF_SCALE}
        height=${box.height * PDF_SCALE}
        vector-effect="non-scaling-stroke"
        style=${clusterStyle}
        data-cluster-id=${clusterId === undefined ? "" : String(clusterId + 1)}
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

      case "path":
        return kind === "path";

      case "rectangle":
        return kind === "rectangle";

      case "image":
        return kind === "image";

      case "all-fragments":
      case "all-layers":
        return true;

      case "clusters":
      case "find-by-text":
        return false;

      case "dbscan-1":
      case "dbscan-2":
      case "dbscan-3":
      case "dbscan-4":
      case "dbscan-ai":
        return this.dbscanClusterIndexByFragment.has(fragment);

      case "original":
        return false;
    }
  }

  private resolveFragmentCssClass(fragment: PdfFragment): string {
    if (this.isDbscanMode(this.layerMode)) {
      return "fragment fragment-dbscan";
    }

    switch (this.resolveOverlayFragmentKind(fragment)) {
      case "text":
        return "fragment fragment-text";

      case "rectangle":
        return "fragment fragment-rectangle";

      case "image":
        return "fragment fragment-image";

      case "path":
        return "fragment fragment-path";

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

  private readonly showPathFragments = async (): Promise<void> => {
    await this.showFragmentLayer("path", "path fragments");
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

  private readonly showClusters = async (): Promise<void> => {
    await this.showClustersLayer();
  };

  private readonly showClustersByText = async (): Promise<void> => {
    await this.showClustersByTextLayer();
  };

  private readonly showDbscan1 = async (): Promise<void> => {
    await this.showDbscanLayer("dbscan-1");
  };

  private readonly showDbscan2 = async (): Promise<void> => {
    await this.showDbscanLayer("dbscan-2");
  };

  private readonly showDbscan3 = async (): Promise<void> => {
    await this.showDbscanLayer("dbscan-3");
  };

  private readonly showDbscan4 = async (): Promise<void> => {
    await this.showDbscanLayer("dbscan-4");
  };

  private readonly showDbscanAi = async (): Promise<void> => {
    await this.showDbscanLayer("dbscan-ai");
  };

  private readonly handleClusterEpsInput = (event: Event): void => {
    const next = Number((event.target as HTMLInputElement).value);

    if (Number.isFinite(next)) {
      this.clusterEps = Math.max(0.5, Math.min(50, next));
    }

    if (this.layerMode === "clusters") {
      void this.showClustersLayer();
    }
  };

  private readonly handleClusterMinPtsInput = (event: Event): void => {
    const next = Number((event.target as HTMLInputElement).value);

    if (Number.isFinite(next)) {
      this.clusterMinPts = Math.max(1, Math.min(20, Math.round(next)));
    }

    if (this.layerMode === "clusters") {
      void this.showClustersLayer();
    }
  };

  private readonly handleClusterTextQueryInput = (event: Event): void => {
    this.clusterTextQuery = (event.target as HTMLInputElement).value;
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
        `Paths: ${this.countKind("path")}. ` +
        `Rectangles: ${this.countKind("rectangle")}. ` +
        `Images: ${this.countKind("image")}. ` +
        `Unknown: ${this.countKind("unknown")}. ` +
        `Total: ${this.fragments.length}.`;
    } catch {
      // ensureFragments has already populated this.error.
    }
  }

  private async showDbscanLayer(
    mode: Extract<LayerMode, "dbscan-1" | "dbscan-2" | "dbscan-3" | "dbscan-4" | "dbscan-ai">,
  ): Promise<void> {
    const config = PdfPidView.DBSCAN_CONFIGS[mode];
    this.beginProcessing(`Running ${config.label}...`);

    try {
      await this.ensureFragments();

      const result = this.dbscanClusterer.cluster(
        this.fragments,
        config.eps,
        config.minPts,
      );

      const assignment = new Map<PdfFragment, number>();
      result.clusters.forEach((cluster, clusterIndex) => {
        cluster.items.forEach((fragment) => {
          assignment.set(fragment, clusterIndex);
        });
      });

      this.dbscanClusterIndexByFragment = assignment;
      this.dbscanClusterCount = result.clusters.length;
      this.dbscanNoiseCount = result.noise.length;
      this.clusterBoxes = [];
      this.clusterReport = this.buildClusterReport({
        modeLabel: config.label,
        eps: config.eps,
        minPts: config.minPts,
        candidateCount: this.fragments.length,
      });
      this.layerMode = mode;
      this.error = null;
      this.message =
        `${config.label}. eps=${config.eps}, minPts=${config.minPts}. ` +
        `Clusters: ${this.dbscanClusterCount}. ` +
        `Clustered fragments: ${this.dbscanClusterIndexByFragment.size}. ` +
        `Noise: ${this.dbscanNoiseCount}. ` +
        `Total: ${this.fragments.length}.`;
      this.endProcessing(`${config.label} completed.`);
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.endProcessing(`${config.label} failed.`);
    }
  }

  private async showClustersLayer(): Promise<void> {
    this.beginProcessing("Running Show Clusters...");

    try {
      await this.ensureFragments();

      const clusterCandidates = this.fragments.filter((fragment) =>
        this.isClusterCandidate(fragment),
      );

      const result = this.dbscanClusterer.cluster(
        clusterCandidates,
        this.clusterEps,
        this.clusterMinPts,
      );

      const strategyClusters = this.applySystemDiscriminatorStrategy(result.clusters);

      const assignment = new Map<PdfFragment, number>();
      strategyClusters.forEach((cluster, clusterIndex) => {
        cluster.items.forEach((fragment) => {
          assignment.set(fragment, clusterIndex);
        });
      });

      this.dbscanClusterIndexByFragment = assignment;
      this.dbscanClusterCount = strategyClusters.length;
      this.dbscanNoiseCount = result.noise.length;
      this.clusterBoxes = this.buildClusterBoxes(strategyClusters);
      this.clusterReport = this.buildClusterReport({
        modeLabel: "Show Clusters",
        eps: this.clusterEps,
        minPts: this.clusterMinPts,
        candidateCount: clusterCandidates.length,
      });
      this.layerMode = "clusters";
      this.error = null;
      this.message =
        `Show Clusters. eps=${this.clusterEps.toFixed(1)}, minPts=${this.clusterMinPts}. ` +
        `Clusters: ${this.dbscanClusterCount}. ` +
        `Clustered fragments: ${this.dbscanClusterIndexByFragment.size}. ` +
        `Noise: ${this.dbscanNoiseCount}. ` +
        `Candidates: ${clusterCandidates.length}. ` +
        `Total: ${this.fragments.length}.`;
      this.endProcessing("Show Clusters completed.");
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.endProcessing("Show Clusters failed.");
    }
  }

  private async showClustersByTextLayer(): Promise<void> {
    const query = this.clusterTextQuery.trim();
    if (query.length === 0) {
      this.error = "Enter tag text to find (example: 41-GT-).";
      return;
    }

    this.beginProcessing(`Running Find Cluster by text "${query}"...`);

    try {
      await this.ensureFragments();

      const textMatches = this.fragments.filter((fragment) =>
        this.fragmentTextContains(fragment, query),
      );

      if (textMatches.length === 0) {
        this.dbscanClusterIndexByFragment = new Map();
        this.dbscanClusterCount = 0;
        this.dbscanNoiseCount = 0;
        this.clusterBoxes = [];
        this.clusterReport = this.buildClusterReport({
          modeLabel: `Find by text "${query}"`,
          eps: this.clusterEps,
          minPts: 1,
          candidateCount: 0,
        });
        this.layerMode = "find-by-text";
        this.message = `No tag fragments matched "${query}".`;
        this.endProcessing("Find Cluster by text completed.");
        return;
      }

      const seededCandidates = this.collectSeededClusterCandidates(textMatches);

      if (seededCandidates.length === 0) {
        this.dbscanClusterIndexByFragment = new Map();
        this.dbscanClusterCount = 0;
        this.dbscanNoiseCount = 0;
        this.clusterBoxes = [];
        this.clusterReport = this.buildClusterReport({
          modeLabel: `Find by text "${query}"`,
          eps: this.clusterEps,
          minPts: this.clusterMinPts,
          candidateCount: 0,
        });
        this.layerMode = "find-by-text";
        this.message = `No nearby cluster candidates found for "${query}".`;
        this.endProcessing("Find Cluster by text completed.");
        return;
      }

      const result = this.dbscanClusterer.cluster(
        seededCandidates,
        this.clusterEps,
        this.clusterMinPts,
      );

      const textMatchSet = new Set(textMatches);
      const strategyClusters = this.applySystemDiscriminatorStrategy(result.clusters);
      const filteredClusters = strategyClusters.filter((cluster) =>
        cluster.items.some((item) => textMatchSet.has(item)),
      );

      const assignment = new Map<PdfFragment, number>();
      filteredClusters.forEach((cluster, clusterIndex) => {
        cluster.items.forEach((fragment) => {
          assignment.set(fragment, clusterIndex);
        });
      });

      this.dbscanClusterIndexByFragment = assignment;
      this.dbscanClusterCount = filteredClusters.length;
      this.dbscanNoiseCount = result.noise.length;
      this.clusterBoxes = this.buildClusterBoxes(filteredClusters);
      this.clusterReport = this.buildClusterReport({
        modeLabel: `Find by text "${query}"`,
        eps: this.clusterEps,
        minPts: this.clusterMinPts,
        candidateCount: seededCandidates.length,
      });
      this.layerMode = "find-by-text";
      this.error = null;
      this.message =
        `Find Cluster by text "${query}". ` +
        `Matches: ${textMatches.length}. ` +
        `Seeded candidates: ${seededCandidates.length}. ` +
        `Clusters: ${this.dbscanClusterCount}. ` +
        `Noise: ${this.dbscanNoiseCount}.`;
      this.endProcessing("Find Cluster by text completed.");
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.endProcessing("Find Cluster by text failed.");
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
    this.clusterBoxes = [];
    const ownsProcessing = !this.isProcessing;
    if (ownsProcessing) {
      this.beginProcessing("Extracting fragments...");
    }

    try {
      const sourceCopy = new Uint8Array(this.originalPdfBinary);

      // Important: store ALL fragment kinds.
      // Do not filter image fragments here, otherwise "Show image fragments" has nothing to render.
      this.fragments = await new PdfEngine().readFragments(sourceCopy);
      this.hasLoadedFragments = true;
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      if (ownsProcessing) {
        this.endProcessing("Fragment extraction failed.");
      }
      throw error;
    } finally {
      this.isFindingFragments = false;
      if (ownsProcessing && this.error === null) {
        this.endProcessing("Fragments extracted.");
      }
    }
  }

  private countVisibleFragments(mode: Exclude<LayerMode, "original">): number {
    if (mode === "clusters") {
      return this.clusterBoxes.length;
    }

    if (mode === "find-by-text") {
      return this.clusterBoxes.length;
    }

    return this.fragments.filter((fragment) => {
      const kind = this.resolveOverlayFragmentKind(fragment);

      switch (mode) {
        case "text":
          return kind === "text";

        case "path":
          return kind === "path";

        case "rectangle":
          return kind === "rectangle";

        case "image":
          return kind === "image";

        case "all-fragments":
        case "all-layers":
          return true;

        case "dbscan-1":
        case "dbscan-2":
        case "dbscan-3":
        case "dbscan-4":
        case "dbscan-ai":
          return this.dbscanClusterIndexByFragment.has(fragment);
      }
    }).length;
  }

  private isDbscanMode(mode: LayerMode): boolean {
    return (
      mode === "dbscan-1"
      || mode === "dbscan-2"
      || mode === "dbscan-3"
      || mode === "dbscan-4"
      || mode === "dbscan-ai"
      || mode === "clusters"
      || mode === "find-by-text"
    );
  }

  private getDbscanStrokeStyle(fragment: PdfFragment): string {
    if (!this.isDbscanMode(this.layerMode)) {
      return "";
    }

    const clusterIndex = this.dbscanClusterIndexByFragment.get(fragment);

    if (clusterIndex === undefined) {
      return "";
    }

    if (this.layerMode === "clusters") {
      return "";
    }

    const hue = (clusterIndex * 47) % 360;
    return `fill: transparent; stroke: hsla(${hue}, 95%, 45%, 0.95);`;
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

    if (rawKind === "path" || rawKind.endsWith(".path") || rawKind.includes("path")) {
      return "path";
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

  private beginProcessing(label: string): void {
    this.isProcessing = true;
    this.processingLabel = label;
  }

  private endProcessing(note: string): void {
    this.isProcessing = false;
    this.processingLabel = null;
    this.lastProcessingNote = `${note} ${new Date().toLocaleTimeString()}`;
  }

  private buildClusterReport(input: {
    modeLabel: string;
    eps: number;
    minPts: number;
    candidateCount: number;
  }): ClusterReport {
    return Object.freeze({
      modeLabel: input.modeLabel,
      eps: input.eps,
      minPts: input.minPts,
      clusterCount: this.dbscanClusterCount,
      clusteredCount: this.dbscanClusterIndexByFragment.size,
      noiseCount: this.dbscanNoiseCount,
      candidateCount: input.candidateCount,
      excludedCount: Math.max(0, this.fragments.length - input.candidateCount),
      totalCount: this.fragments.length,
      generatedAt: new Date().toLocaleTimeString(),
    });
  }

  private isClusterCandidate(fragment: PdfFragment): boolean {
    const kind = this.resolveOverlayFragmentKind(fragment);
    if (kind !== "text" && kind !== "rectangle" && kind !== "path") {
      return false;
    }

    const box = fragment.boundingBox;
    const width = box.width;
    const height = box.height;
    if (width <= 0 || height <= 0) {
      return false;
    }

    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    const aspectRatio = shortSide > 0 ? longSide / shortSide : Number.POSITIVE_INFINITY;
    const area = width * height;

    // Remove likely page/frame/background boxes.
    const pageInfo = this.pages.find((page) => page.pageNumber === fragment.pageNumber);
    if (pageInfo !== undefined) {
      const pageWidth = pageInfo.width / PDF_SCALE;
      const pageHeight = pageInfo.height / PDF_SCALE;
      const pageArea = pageWidth * pageHeight;
      if (area > pageArea * 0.02) {
        return false;
      }
    }

    // Remove line-like fragments and very thin connectors that cause chain-clustering.
    if (area < 0.6) {
      return false;
    }

    if (shortSide < 0.9 && longSide > 16) {
      return false;
    }

    if (shortSide <= 1.6 && aspectRatio > 10) {
      return false;
    }

    if (shortSide <= 3 && longSide > 90) {
      return false;
    }

    return true;
  }

  private getClusterBoxes(pageNumber: number): readonly ClusterOverlayBox[] {
    if (this.layerMode !== "clusters" && this.layerMode !== "find-by-text") {
      return [];
    }

    return this.clusterBoxes.filter((box) => box.pageNumber === pageNumber);
  }

  private fragmentTextContains(fragment: PdfFragment, query: string): boolean {
    if (this.resolveOverlayFragmentKind(fragment) !== "text") {
      return false;
    }

    if (!("text" in fragment) || typeof fragment.text !== "string") {
      return false;
    }

    const normalizedFragment = this.normalizeTagSearchText(fragment.text);
    const normalizedQuery = this.normalizeTagSearchText(query);

    if (normalizedQuery.length === 0) {
      return false;
    }

    return (
      normalizedFragment.startsWith(normalizedQuery)
      || normalizedFragment.includes(normalizedQuery)
    );
  }

  private normalizeTagSearchText(value: string): string {
    return value
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[–—]/g, "-");
  }

  private applySystemDiscriminatorStrategy(
    clusters: readonly Readonly<{ id: string; items: readonly PdfFragment[] }>[],
  ): readonly Readonly<{ id: string; items: readonly PdfFragment[] }>[] {
    const output: Array<Readonly<{ id: string; items: readonly PdfFragment[] }>> = [];

    clusters.forEach((cluster) => {
      const split = this.splitClusterBySystemNumber(cluster);
      output.push(...split);
    });

    return output;
  }

  private splitClusterBySystemNumber(
    cluster: Readonly<{ id: string; items: readonly PdfFragment[] }>,
  ): readonly Readonly<{ id: string; items: readonly PdfFragment[] }>[] {
    const anchorsBySystem = new Map<string, PdfFragment[]>();

    cluster.items.forEach((item) => {
      const system = this.extractSystemNumber(item);
      if (system === null) {
        return;
      }
      const anchors = anchorsBySystem.get(system);
      if (anchors === undefined) {
        anchorsBySystem.set(system, [item]);
      } else {
        anchors.push(item);
      }
    });

    if (anchorsBySystem.size <= 1) {
      return [cluster];
    }

    const itemsBySystem = new Map<string, PdfFragment[]>();
    anchorsBySystem.forEach((_, system) => {
      itemsBySystem.set(system, []);
    });

    cluster.items.forEach((item) => {
      const ownSystem = this.extractSystemNumber(item);
      if (ownSystem !== null && itemsBySystem.has(ownSystem)) {
        itemsBySystem.get(ownSystem)!.push(item);
        return;
      }

      let bestSystem: string | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      anchorsBySystem.forEach((anchors, system) => {
        for (const anchor of anchors) {
          const distance = this.fragmentCenterDistance(item, anchor);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestSystem = system;
          }
        }
      });

      if (bestSystem !== null) {
        itemsBySystem.get(bestSystem)!.push(item);
      }
    });

    const splitClusters: Array<Readonly<{ id: string; items: readonly PdfFragment[] }>> = [];
    let index = 0;
    itemsBySystem.forEach((items, system) => {
      if (items.length === 0) {
        return;
      }
      splitClusters.push({
        id: `${cluster.id}-sys-${system}-${index}`,
        items,
      });
      index += 1;
    });

    return splitClusters.length > 0 ? splitClusters : [cluster];
  }

  private extractSystemNumber(fragment: PdfFragment): string | null {
    if (this.resolveOverlayFragmentKind(fragment) !== "text") {
      return null;
    }

    if (!("text" in fragment) || typeof fragment.text !== "string") {
      return null;
    }

    const normalized = this.normalizeTagSearchText(fragment.text);
    const match = normalized.match(/^(\d{2})-/);
    return match?.[1] ?? null;
  }

  private collectSeededClusterCandidates(
    seedTexts: readonly PdfFragment[],
  ): readonly PdfFragment[] {
    const seen = new Set<PdfFragment>();
    const output: PdfFragment[] = [];
    const radius = Math.max(8, this.clusterEps * 6);

    const add = (fragment: PdfFragment): void => {
      if (seen.has(fragment)) {
        return;
      }
      seen.add(fragment);
      output.push(fragment);
    };

    seedTexts.forEach((seed) => {
      add(seed);
      this.fragments.forEach((fragment) => {
        if (fragment.pageNumber !== seed.pageNumber) {
          return;
        }
        if (!this.isClusterCandidate(fragment)) {
          return;
        }
        if (this.fragmentCenterDistance(seed, fragment) <= radius) {
          add(fragment);
        }
      });
    });

    return output;
  }

  private fragmentCenterDistance(left: PdfFragment, right: PdfFragment): number {
    const leftCx = left.boundingBox.position.x + left.boundingBox.width / 2;
    const leftCy = left.boundingBox.position.y + left.boundingBox.height / 2;
    const rightCx = right.boundingBox.position.x + right.boundingBox.width / 2;
    const rightCy = right.boundingBox.position.y + right.boundingBox.height / 2;
    return Math.hypot(leftCx - rightCx, leftCy - rightCy);
  }

  private buildClusterBoxes(
    clusters: readonly Readonly<{ id: string; items: readonly PdfFragment[] }>[],
  ): readonly ClusterOverlayBox[] {
    const boxes: ClusterOverlayBox[] = [];
    const gap = Math.max(1, this.clusterEps * 1.5);

    clusters.forEach((cluster, clusterIndex) => {
      const byPage = new Map<number, PdfFragment[]>();
      cluster.items.forEach((item) => {
        const list = byPage.get(item.pageNumber);
        if (list === undefined) {
          byPage.set(item.pageNumber, [item]);
        } else {
          list.push(item);
        }
      });

      byPage.forEach((items, pageNumber) => {
        const components = this.splitIntoConnectedComponents(items, gap);

        components.forEach((component) => {
          const bounds = this.computeBounds(component);
          boxes.push({
            clusterIndex,
            pageNumber,
            itemCount: component.length,
            boundingBox: bounds,
          });
        });
      });
    });

    return this.suppressOverlappingClusterBoxes(boxes);
  }

  private suppressOverlappingClusterBoxes(
    boxes: readonly ClusterOverlayBox[],
  ): readonly ClusterOverlayBox[] {
    const byPage = new Map<number, ClusterOverlayBox[]>();

    boxes.forEach((box) => {
      const existing = byPage.get(box.pageNumber);
      if (existing === undefined) {
        byPage.set(box.pageNumber, [box]);
      } else {
        existing.push(box);
      }
    });

    const keptAcrossPages: ClusterOverlayBox[] = [];

    byPage.forEach((pageBoxes) => {
      const sorted = pageBoxes
        .slice()
        .sort((left, right) => this.clusterBoxScore(right) - this.clusterBoxScore(left));

      const kept: ClusterOverlayBox[] = [];

      sorted.forEach((candidate) => {
        const overlaps = kept.some((selected) =>
          this.shouldSuppressCandidate(candidate, selected),
        );

        if (!overlaps) {
          kept.push(candidate);
        }
      });

      keptAcrossPages.push(...kept);
    });

    return Object.freeze(keptAcrossPages);
  }

  private shouldSuppressCandidate(
    candidate: ClusterOverlayBox,
    selected: ClusterOverlayBox,
  ): boolean {
    const iou = this.computeIoU(candidate.boundingBox, selected.boundingBox);
    if (iou > 0.35) {
      return true;
    }

    const containment = this.computeContainment(
      candidate.boundingBox,
      selected.boundingBox,
    );

    return containment > 0.8;
  }

  private clusterBoxScore(box: ClusterOverlayBox): number {
    const area = this.computeArea(box.boundingBox);
    const density = box.itemCount / Math.max(area, 1);
    return density + box.itemCount * 0.00001;
  }

  private computeIoU(
    left: PdfFragment["boundingBox"],
    right: PdfFragment["boundingBox"],
  ): number {
    const intersection = this.computeIntersectionArea(left, right);
    if (intersection <= 0) {
      return 0;
    }

    const union = this.computeArea(left) + this.computeArea(right) - intersection;
    if (union <= 0) {
      return 0;
    }

    return intersection / union;
  }

  private computeContainment(
    left: PdfFragment["boundingBox"],
    right: PdfFragment["boundingBox"],
  ): number {
    const intersection = this.computeIntersectionArea(left, right);
    if (intersection <= 0) {
      return 0;
    }

    const minArea = Math.min(this.computeArea(left), this.computeArea(right));
    if (minArea <= 0) {
      return 0;
    }

    return intersection / minArea;
  }

  private computeIntersectionArea(
    left: PdfFragment["boundingBox"],
    right: PdfFragment["boundingBox"],
  ): number {
    const leftMinX = left.position.x;
    const leftMinY = left.position.y;
    const leftMaxX = left.position.x + left.width;
    const leftMaxY = left.position.y + left.height;

    const rightMinX = right.position.x;
    const rightMinY = right.position.y;
    const rightMaxX = right.position.x + right.width;
    const rightMaxY = right.position.y + right.height;

    const overlapWidth = Math.max(0, Math.min(leftMaxX, rightMaxX) - Math.max(leftMinX, rightMinX));
    const overlapHeight = Math.max(0, Math.min(leftMaxY, rightMaxY) - Math.max(leftMinY, rightMinY));

    return overlapWidth * overlapHeight;
  }

  private computeArea(box: PdfFragment["boundingBox"]): number {
    return Math.max(0, box.width) * Math.max(0, box.height);
  }

  private splitIntoConnectedComponents(
    items: readonly PdfFragment[],
    gap: number,
  ): readonly PdfFragment[][] {
    const visited = new Array(items.length).fill(false);
    const components: PdfFragment[][] = [];

    for (let i = 0; i < items.length; i += 1) {
      if (visited[i]) {
        continue;
      }

      visited[i] = true;
      const queue: number[] = [i];
      const component: PdfFragment[] = [];

      while (queue.length > 0) {
        const currentIndex = queue.pop()!;
        const current = items[currentIndex]!;
        component.push(current);

        for (let j = 0; j < items.length; j += 1) {
          if (visited[j]) {
            continue;
          }

          const candidate = items[j]!;
          if (this.boxesTouchWithinGap(current, candidate, gap)) {
            visited[j] = true;
            queue.push(j);
          }
        }
      }

      components.push(component);
    }

    return Object.freeze(components);
  }

  private boxesTouchWithinGap(
    left: PdfFragment,
    right: PdfFragment,
    gap: number,
  ): boolean {
    const lMinX = left.boundingBox.position.x - gap;
    const lMinY = left.boundingBox.position.y - gap;
    const lMaxX = left.boundingBox.position.x + left.boundingBox.width + gap;
    const lMaxY = left.boundingBox.position.y + left.boundingBox.height + gap;

    const rMinX = right.boundingBox.position.x;
    const rMinY = right.boundingBox.position.y;
    const rMaxX = right.boundingBox.position.x + right.boundingBox.width;
    const rMaxY = right.boundingBox.position.y + right.boundingBox.height;

    return lMinX <= rMaxX && lMaxX >= rMinX && lMinY <= rMaxY && lMaxY >= rMinY;
  }

  private computeBounds(items: readonly PdfFragment[]): PdfFragment["boundingBox"] {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    items.forEach((item) => {
      const left = item.boundingBox.position.x;
      const top = item.boundingBox.position.y;
      const right = left + item.boundingBox.width;
      const bottom = top + item.boundingBox.height;
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    });

    return {
      position: {
        x: minX,
        y: minY,
      },
      width: Math.max(0.2, maxX - minX),
      height: Math.max(0.2, maxY - minY),
    };
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

    .cluster-controls {
      display: grid;
      gap: 0.35rem;
      padding: 0.55rem;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(249, 244, 233, 0.5);
    }

    .cluster-controls label {
      font-size: 0.82rem;
      color: var(--text-muted);
      font-weight: 700;
    }

    .cluster-controls input[type="range"] {
      width: 100%;
    }

    .cluster-controls input[type="text"] {
      width: 100%;
      min-height: 2rem;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 0.3rem 0.45rem;
      font: inherit;
      font-size: 0.86rem;
      color: var(--text);
      background: #fffdf8;
    }

    .processing-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.2rem;
      font-size: 0.82rem;
      color: var(--text-muted);
      font-weight: 700;
    }

    .spinner {
      width: 0.9rem;
      height: 0.9rem;
      border: 2px solid rgba(15, 23, 42, 0.2);
      border-top-color: rgba(15, 23, 42, 0.85);
      border-radius: 999px;
      animation: spin 0.8s linear infinite;
      flex: 0 0 auto;
    }

    .processing-note {
      margin: 0;
      font-size: 0.78rem;
      line-height: 1.3;
      color: var(--text-muted);
      overflow-wrap: anywhere;
    }

    .cluster-report {
      display: grid;
      gap: 0.1rem;
      padding: 0.55rem;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(249, 244, 233, 0.5);
    }

    .cluster-report p {
      margin: 0;
      font-size: 0.78rem;
      line-height: 1.3;
      color: var(--text-muted);
      overflow-wrap: anywhere;
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
    .mode-path .original-layer,
    .mode-rectangle .original-layer,
    .mode-all-fragments .original-layer {
      visibility: hidden;
    }

    .mode-original .fragment-layer {
      visibility: hidden;
    }

    .mode-image .original-layer,
    .mode-image .fragment-layer,
    .mode-clusters .fragment-layer,
    .mode-find-by-text .fragment-layer,
    .mode-all-layers .original-layer,
    .mode-all-layers .fragment-layer,
    .mode-dbscan-1 .fragment-layer,
    .mode-dbscan-2 .fragment-layer,
    .mode-dbscan-3 .fragment-layer,
    .mode-dbscan-4 .fragment-layer,
    .mode-dbscan-ai .fragment-layer {
      visibility: visible;
    }

    .fragment-layer rect.fragment {
      stroke-width: 1;
    }

    .fragment-layer rect.fragment-text {
      fill: transparent;
      stroke: rgba(30, 144, 255, 0.95);
    }

    .fragment-layer rect.fragment-rectangle {
      fill: transparent;
      stroke: rgba(22, 163, 74, 0.95);
    }

    .fragment-layer rect.fragment-image {
      fill: transparent;
      stroke: rgba(147, 51, 234, 1);
      stroke-width: 2;
      stroke-dasharray: 6 4;
    }

    .fragment-layer rect.fragment-path {
      fill: transparent;
      stroke: rgba(217, 119, 6, 0.95);
      stroke-width: 1.2;
    }

    .fragment-layer rect.fragment-unknown {
      fill: transparent;
      stroke: rgba(255, 0, 0, 0.85);
      stroke-dasharray: 2 2;
    }

    .fragment-layer rect.fragment-dbscan {
      fill: transparent;
      stroke-width: 0.9;
    }

    .fragment-layer rect.cluster-box {
      stroke-width: 1.6;
      stroke-dasharray: 6 3;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
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
