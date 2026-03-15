
export interface IReadOnlySpectrum3 {
    readonly width: number;
    readonly height: number;
    readonly depth: number;

    sampleReal(i: number, j: number, k: number): number;
    sampleImaginary(i: number, j: number, k: number): number;
}
