import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

import type { IPdfDocumentFactory } from "./IPdfDocumentFactory.js";
import { PdfJsDocument } from "./PdfJsDocument.js";

export interface IPdfJsDocumentProxy {
  readonly numPages: number;
  getPage(pageNumber: number): Promise<IPdfJsPageProxy>;
  getMetadata(): Promise<{ info?: object }>;
}

export interface IPdfJsPageProxy {
  readonly pageNumber: number;
  getTextContent(): Promise<{ items: readonly unknown[] }>;
  getViewport(parameters: { scale: number }): IPdfJsViewport;
}

export interface IPdfJsViewport {
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  readonly transform: readonly number[];
}

export class PdfJsDocumentFactory implements IPdfDocumentFactory {
  public async open(binary: Uint8Array) {
    const loadingTask = pdfjs.getDocument({
      data: binary,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: false,
    });

    const document = (await loadingTask.promise) as unknown as IPdfJsDocumentProxy;
    return new PdfJsDocument(document);
  }
}