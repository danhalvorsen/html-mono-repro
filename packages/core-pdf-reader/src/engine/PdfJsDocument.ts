
import type { IPdfMetadata } from "../IPdfMetadata.js";
import { IPdfDocument } from "./IPdfDocument.js";
import type { IPdfPage } from "./IPdfPage.js";
import type { IPdfJsDocumentProxy } from "./PdfJsDocumentFactory.js";
import { PdfJsPage } from "./PdfJsPage.js";

export class PdfJsDocument implements IPdfDocument {
  public constructor(
    private readonly inner: IPdfJsDocumentProxy,
  ) {}

  public get pageCount(): number {
    return this.inner.numPages;
  }

  public async readMetadata(): Promise<IPdfMetadata> {
    const metadata = await this.inner.getMetadata();
    const info = (metadata.info ?? {}) as Record<string, unknown>;

    return Object.freeze({
      ...(typeof info["Title"] === "string" && { title: info["Title"] }),
      ...(typeof info["Author"] === "string" && { author: info["Author"] }),
      ...(typeof info["Subject"] === "string" && { subject: info["Subject"] }),
      ...(typeof info["Creator"] === "string" && { creator: info["Creator"] }),
      ...(typeof info["Producer"] === "string" && { producer: info["Producer"] }),
      ...(typeof info["CreationDate"] === "string" && {
        creationDateUtc: info["CreationDate"],
      }),
      ...(typeof info["ModDate"] === "string" && {
        modificationDateUtc: info["ModDate"],
      }),
    });
  }

  public async getPage(pageNumber: number): Promise<IPdfPage> {
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > this.pageCount) {
      throw new RangeError(`Invalid PDF page number '${pageNumber}'.`);
    }

    const page = await this.inner.getPage(pageNumber);
    return new PdfJsPage(page);
  }
}
