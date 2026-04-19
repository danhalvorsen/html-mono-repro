import type { IPdfFragment } from "@monorepo/core-pdf-domain"

export interface IPdfFragmentWriter {
    write(
        pdfBinary: Uint8Array,
        fragments: readonly IPdfFragment[]
    ): Promise<Uint8Array>;
}
