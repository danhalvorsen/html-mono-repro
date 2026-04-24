import type { PdfFragment } from "@monorepo/core-pdf-domain"

export interface IPdfFragmentReader {
    read(pdfBinary: Uint8Array): Promise<readonly PdfFragment[]>;
    readJson(pdfBinary: Uint8Array): Promise<string>;
}
