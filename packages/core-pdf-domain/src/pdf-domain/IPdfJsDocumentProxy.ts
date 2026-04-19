import { IPdfJsPageProxy } from "./IPdfJsPageProxy.js";

// ============================================================================
// packages/core-pdf-domain/src/IPdfJsDocumentProxy.ts
// ============================================================================

export interface IPdfJsDocumentProxy {
    readonly numPages: number;
    getPage(pageNumber: number): Promise<IPdfJsPageProxy>;
    getMetadata(): Promise<{ info?: object | undefined; }>;
}
