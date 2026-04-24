import type { PdfFragment } from "@monorepo/core-pdf-domain"

export interface IPdfFragmentWriter {
    write(
        pdfBinary: Uint8Array,
        fragments: readonly PdfFragment[]
    ): Promise<Uint8Array>;
}
