// ====================================================================================
// FILE: src/interpolation/IColorInterpolationSpace.ts
// ====================================================================================
import { Color } from "../colors/Color.js";

export interface IColorInterpolationSpace {
    interpolate(start: Color, end: Color, amount: number): Color;
}
