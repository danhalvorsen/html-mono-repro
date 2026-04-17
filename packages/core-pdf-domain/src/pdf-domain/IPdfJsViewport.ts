// ============================================================================
// packages/core-pdf-domain/src/IPdfJsViewport.ts
// ============================================================================

export interface IPdfJsViewport {
    readonly width: number;
    readonly height: number;
    readonly scale: number;
    readonly transform: readonly number[];
}
