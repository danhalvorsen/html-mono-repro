// code.ts
// ============================================================
// SPECTRAL CONTRACTS
// ============================================================

export interface IReadOnlySpectrum1 {
    readonly size: number;

    sampleReal(i: number): number;
    sampleImaginary(i: number): number;
}
