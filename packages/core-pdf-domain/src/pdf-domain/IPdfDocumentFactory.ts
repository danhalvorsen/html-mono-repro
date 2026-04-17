import { IPdfDocument } from "./IPdfDocument.js";

// ============================================================================
// packages/core-pdf-domain/src/IPdfDocumentFactory.ts
// ============================================================================

export interface IPdfDocumentFactory {
    open(binary: Uint8Array): Promise<IPdfDocument>;
}
