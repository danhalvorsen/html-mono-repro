import type { IPdfFragment } from "@monorepo/core-pdf-domain"

export interface IPdfFragmentReader {
    read(pdfBinary: Uint8Array): Promise<readonly IPdfFragment[]>;
    readJson(pdfBinary: Uint8Array): Promise<string>;
}
