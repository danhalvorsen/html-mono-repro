import "@monorepo/core-pdf-presenter";
import {
  CompositePdfEngine,
  InMemoryPdfBinarySource,
  PdfReader,
} from "@monorepo/core-pdf-reader";

class SamplePdfReaderElement extends HTMLElement {
  public connectedCallback(): void {
    void this.renderPdf();
  }

  private async renderPdf(): Promise<void> {
    const src = this.getAttribute("src") ?? "./samples/sample3/Kiwi.pdf";

    this.innerHTML = `<p id="status">Reading ${src}...</p>`;

    try {
      const response = await fetch(src);

      if (!response.ok) {
        throw new Error(`Failed to load sample PDF: HTTP ${response.status}`);
      }

      const bytes = new Uint8Array(await response.arrayBuffer());
      const source = new InMemoryPdfBinarySource("Kiwi.pdf", bytes);
      const reader = new PdfReader(new CompositePdfEngine());
      const pages = await reader.read(source);

      this.innerHTML = `
        <p id="status">Parsed ${pages.length} page(s) from Kiwi.pdf.</p>
        <pdf-presenter src="${src}" width="980" height="680"></pdf-presenter>
      `;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.innerHTML = `<pre id="status">PDF read failed: ${message}</pre>`;
    }
  }
}

if (!customElements.get("pdf-reader")) {
  customElements.define("pdf-reader", SamplePdfReaderElement);
}
