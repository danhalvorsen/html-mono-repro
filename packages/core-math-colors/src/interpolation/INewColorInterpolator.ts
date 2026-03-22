// ====================================================================================
// FILE: packages/core-math-colors/src/interpolation/INewColorInterpolator.ts
// ====================================================================================

export interface INewColorInterpolator<TColor> {
    sample(position: number): TColor;
    sampleMany(positions: readonly number[]): readonly TColor[];
}
