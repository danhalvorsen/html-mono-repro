import { IPdfBinarySource } from "./IPdfBinarySource.js";
import { IPdfPageText } from "./IPdfPageText.js";

// ============================================================================
// packages/core-pdf-domain/src/IPdfReader.ts
// ============================================================================

export interface IPdfReader {
    readonly read: (source: IPdfBinarySource) => Promise<readonly IPdfPageText[]>;
}
