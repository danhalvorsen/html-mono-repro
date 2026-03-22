// ============================================================================
// FILE: src/domain/geometry/Rectangle.ts
// ============================================================================

export type Rectangle = Readonly<{
    x: number;
    y: number;
    width: number;
    height: number;
    depth?: number; // extrusion depth (optional)
}>;
