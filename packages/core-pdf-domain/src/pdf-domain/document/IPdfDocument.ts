import { IPdfMetadata } from "./IPdfMetadata.js";
import { IPdfPage } from "./IPdfPage.js";

// ============================================================================
// packages/core-pdf-domain/src/IPdfDocument.ts
// ============================================================================

export interface IPdfDocument {
    readonly pageCount: number;

    readMetadata(): Promise<IPdfMetadata>;

    getPage(pageNumber: number): Promise<IPdfPage>;
}
