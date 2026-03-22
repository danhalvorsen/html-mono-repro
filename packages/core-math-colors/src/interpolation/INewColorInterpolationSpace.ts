// ====================================================================================
// FILE: packages/core-math-colors/src/interpolation/INewColorInterpolationSpace.ts
// ====================================================================================

export interface INewColorInterpolationSpace<TColor> {
    interpolate(start: TColor, end: TColor, amount: number): TColor;
}
