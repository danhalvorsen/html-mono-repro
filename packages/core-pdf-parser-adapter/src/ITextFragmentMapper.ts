import type { IPdfFragment } from "@monorepo/core-pdf-domain"

/* =================================================================================================
   pdfjs text mapper
   ================================================================================================= */

export interface ITextFragmentMapper<TItem, TContent, TViewport> {
    map(
        pageNumber: number,
        index: number,
        item: TItem,
        content: TContent,
        viewport: TViewport
    ): IPdfFragment | null;
}
