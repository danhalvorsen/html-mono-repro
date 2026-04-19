
import type { IPdfFragment } from "@monorepo/core-pdf-domain"

export interface IPdfParserPage {
    readonly pageNumber: number;
    readFragments(startIndex: number): Promise<readonly IPdfFragment[]>;
}
