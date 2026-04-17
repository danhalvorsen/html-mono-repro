import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

import type { IPdfDocumentFactory } from "./IPdfDocumentFactory.js";
import type { IPdfDocument } from "./IPdfDocument.js";
import { PdfJsDocument } from "./PdfJsDocument.js";

export interface IPdfJsTextStyle {
  readonly fontFamily?: string;
}

export interface IPdfJsTextContent {
  readonly items: readonly unknown[];
  readonly styles?: Readonly<Record<string, IPdfJsTextStyle>>;
}

export interface IPdfJsDocumentProxy {
  readonly numPages: number;
  getPage(pageNumber: number): Promise<IPdfJsPageProxy>;
  getMetadata(): Promise<{ info?: object }>;
}

export interface IPdfJsPageProxy {
  readonly pageNumber: number;
  getTextContent(): Promise<IPdfJsTextContent>;
  getViewport(parameters: { scale: number }): IPdfJsViewport;
}

export interface IPdfJsViewport {
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  readonly transform: readonly number[];
}

export class PdfJsDocumentFactory implements IPdfDocumentFactory {
  public async open(binary: Uint8Array): Promise<IPdfDocument> {
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