import type { PdfFragment } from "@monorepo/core-pdf-domain"

export interface IPdfJsonProjector {
    toJson(fragments: readonly PdfFragment[]): string;
}
