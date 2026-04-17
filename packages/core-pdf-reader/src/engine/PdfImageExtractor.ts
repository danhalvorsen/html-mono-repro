import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";

import type { IReaderConfiguration } from "../IReaderConfiguration.js";
import type { IPdfImageFragment } from "../IPdfImageFragment.js";

type KnownMimeType = "image/jpeg" | "image/jp2";

export class PdfImageExtractor {
  public constructor(
    private readonly configuration: IReaderConfiguration,
  ) {}

  public async readImageFragments(
    binary: Uint8Array,
  ): Promise<readonly IPdfImageFragment[]> {
    if (!this.configuration.saveReadImages) {
      return Object.freeze([]);
    }

    const pdfDocument = await PDFDocument.load(binary);
    const result: IPdfImageFragment[] = [];

    const pageCount = pdfDocument.getPageCount();

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
      const page = pdfDocument.getPage(pageIndex);

      const resources = page.node.Resources();
      if (resources === undefined) continue;

      const xObjectRef = resources.get(PDFName.of("XObject"));
      if (xObjectRef === undefined) continue;

      const xObjectDictionary = pdfDocument.context.lookup(xObjectRef) as unknown as {
        entries(): Iterable<[unknown, unknown]>;
        lookup(key: unknown): unknown;
      };

      for (const [nameKey] of xObjectDictionary.entries()) {
        const object = xObjectDictionary.lookup(nameKey);

        if (!(object instanceof PDFRawStream)) continue;

        const subtype = object.dict.get(PDFName.of("Subtype"));
        if (String(subtype) !== "/Image") continue;

        const filterValue = object.dict.get(PDFName.of("Filter"));
        const extension = this.detectImageExtension(filterValue);

        if (extension === "bin") continue;

        const mimeType = this.mapMimeType(extension);
        if (mimeType === undefined) continue;

        const bytes = object.getContents();
        if (!bytes || bytes.length === 0) continue;

        const fragment: IPdfImageFragment = Object.freeze({
          pageNumber: pageIndex + 1,
          name: this.normalizeName(nameKey),
          mimeType, // guaranteed string (no undefined)
          boundingBox: Object.freeze({
            position: Object.freeze({ x: 0, y: 0 }),
            width: 0,
            height: 0,
          }),
          bytes: bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes),
        });

        result.push(fragment);
      }
    }

    return Object.freeze(result);
  }

  private normalizeName(nameKey: unknown): string {
    return String(nameKey).replace(/^\//, "");
  }

  private detectImageExtension(filterValue: unknown): string {
    const normalized = String(filterValue);

    if (normalized.includes("/DCTDecode")) return "jpg";
    if (normalized.includes("/JPXDecode")) return "jp2";

    if (normalized.includes("/FlateDecode")) return "bin";
    if (normalized.includes("/LZWDecode")) return "bin";
    if (normalized.includes("/CCITTFaxDecode")) return "bin";

    return "bin";
  }

  private mapMimeType(extension: string): KnownMimeType | undefined {
    switch (extension) {
      case "jpg":
        return "image/jpeg";
      case "jp2":
        return "image/jp2";
      default:
        return undefined;
    }
  }
}