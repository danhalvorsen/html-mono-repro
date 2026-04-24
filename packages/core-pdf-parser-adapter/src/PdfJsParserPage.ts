import { PdfJsNativePage, PdfJsNativeTextItem, PdfJsNativeTextContent, PdfJsNativeViewport } from "./code.js";
import { ITextFragmentMapper } from "./ITextFragmentMapper.js";
import { GuardedAdapter } from "./GuardedAdapter.js";
import { IPdfParserPage } from "./IPdfParserPage.js";
import type { PdfFragment } from "@monorepo/core-pdf-domain"

/* =================================================================================================
   pdfjs document/page adapter
   ================================================================================================= */

export class PdfJsParserPage extends GuardedAdapter implements IPdfParserPage {
    public constructor(
        private readonly inner: PdfJsNativePage,
        private readonly mapper: ITextFragmentMapper<PdfJsNativeTextItem, PdfJsNativeTextContent, PdfJsNativeViewport>
    ) {
        super();
    }

    public get pageNumber(): number {
        return this.inner.pageNumber;
    }

    public async readFragments(startIndex: number): Promise<readonly PdfFragment[]> {
        this.ensureFinite(startIndex, "startIndex");

        const content = await this.inner.getTextContent();
        const viewport = this.inner.getViewport({ scale: 1 });
        const result: PdfFragment[] = [];

        let index = startIndex;

        for (const item of content.items) {
            const fragment = this.mapper.map(
                this.pageNumber,
                index,
                item as PdfJsNativeTextItem,
                content,
                viewport
            );

            if (fragment === null) {
                continue;
            }

            result.push(fragment);
            index += 1;
        }

        return Object.freeze(result);
    }
}
