
import type { PdfFragment } from "@monorepo/core-pdf-domain"

export interface IPdfParserPage {
    readonly pageNumber: number;
    readFragments(startIndex: number): Promise<readonly PdfFragment[]>;
}
