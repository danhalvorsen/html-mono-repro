import { FragmentKinds, type PdfFragment } from "@monorepo/core-pdf-domain";

import type { IPdfPageText } from "../IPdfPageText.js";
import type { IPdfTextFragment } from "../IPdfTextFragment.js";
import type { IPdfEngine } from "./IPdfEngine.js";
import type { IPdfDocumentFactory } from "./IPdfDocumentFactory.js";
import { PdfJsDocumentFactory } from "./PdfJsDocumentFactory.js";
import { PdfRectangleExtractor } from "./PdfRectangleExtractor.js";

export class PdfEngine implements IPdfEngine {
  public readonly name = "pdfjs-composite-engine";
  public constructor(
    private readonly documentFactory: IPdfDocumentFactory = new PdfJsDocumentFactory(),
    private readonly rectangleExtractor: PdfRectangleExtractor = new PdfRectangleExtractor(),
  ) {}

  public async readMetadata(binary: Uint8Array) {
    const document = await this.documentFactory.open(new Uint8Array(binary));
    return document.readMetadata();
  }

  public async readPageCount(binary: Uint8Array): Promise<number> {
    const document = await this.documentFactory.open(new Uint8Array(binary));
    return document.pageCount;
  }

  public async readPages(binary: Uint8Array): Promise<readonly IPdfPageText[]> {
    const document = await this.documentFactory.open(new Uint8Array(binary));
    const pages: IPdfPageText[] = [];
    for (
      let pageNumber = 1;
      pageNumber <= document.pageCount;
      pageNumber += 1
    ) {
      const page = await document.getPage(pageNumber);
      pages.push(await page.readText());
    }
    return Object.freeze(pages);
  }

  public async readFragments(
    binary: Uint8Array,
  ): Promise<readonly PdfFragment[]> {
    const textFragments = await this.readTextFragments(binary);
    const rectangleFragments =
      await this.rectangleExtractor.readRectangleFragments(
        binary,
        textFragments,
      );
    const normalizedTextFragments: readonly PdfFragment[] = textFragments.map(
      (fragment) => ({
        kind: FragmentKinds.Text,
        pageNumber: fragment.pageNumber,
        text: fragment.text,
        boundingBox: fragment.boundingBox,
        ...(typeof fragment.fontName === "string" && {
          fontName: fragment.fontName,
        }),
        ...(typeof fragment.fontFamily === "string" && {
          fontFamily: fragment.fontFamily,
        }),
        ...(typeof fragment.fontSize === "number" && {
          fontSize: fragment.fontSize,
        }),
      }),
    );

    return Object.freeze([...normalizedTextFragments, ...rectangleFragments]);
  }

  public async readTextFragments(
    binary: Uint8Array,
  ): Promise<readonly IPdfTextFragment[]> {
    const document = await this.documentFactory.open(new Uint8Array(binary));
    const fragments: IPdfTextFragment[] = [];

    for (
      let pageNumber = 1;
      pageNumber <= document.pageCount;
      pageNumber += 1
    ) {
      const page = await document.getPage(pageNumber);
      fragments.push(...(await page.readTextFragments()));
    }

    return Object.freeze(fragments);
  }

}
