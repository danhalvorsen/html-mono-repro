export interface IReadOnlySpectrum2 {
    readonly width: number;
    readonly height: number;

    sampleReal(i: number, j: number): number;
    sampleImaginary(i: number, j: number): number;
}
