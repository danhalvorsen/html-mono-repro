// ====================================================================================
// FILE: src/interpolation/IColorInterpolator.ts
// ====================================================================================

import { Color } from  "../colors/Color.js";
export interface IColorInterpolator {
  sample(position: number): Color;
  sampleMany(positions: readonly number[]): readonly Color[];
}

