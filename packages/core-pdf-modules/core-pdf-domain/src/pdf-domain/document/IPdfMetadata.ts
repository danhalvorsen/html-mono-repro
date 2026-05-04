// ============================================================================
// packages/core-pdf-domain/src/IPdfMetadata.ts
// ============================================================================

export interface IPdfMetadata {
    readonly title?: string | undefined;
    readonly author?: string | undefined;
    readonly subject?: string | undefined;
    readonly keywords?: readonly string[] | undefined;
    readonly creator?: string | undefined;
    readonly producer?: string | undefined;
    readonly creationDateUtc?: string | undefined;
    readonly modificationDateUtc?: string | undefined;
}
