// ====================================================================================
// FILE: src/interpolation/SrgbColorInterpolationSpace.ts
// ====================================================================================

import { Color } from "../colors/Color.js";
import type { IColorInterpolationSpace } from "./IColorInterpolationSpace.js";

export class SrgbColorInterpolationSpace implements IColorInterpolationSpace {
 
  public interpolate(start: Color, end: Color, amount: number): Color {
    const t = this.ensureInterpolationAmount(amount);

    return Color.fromNormalized(
      this.lerp(start.red, end.red, t),
      this.lerp(start.green, end.green, t),
      this.lerp(start.blue, end.blue, t),
      this.lerp(start.alpha, end.alpha, t),
    );
  }

  private lerp(start: number, end: number, amount: number): number {
    return start + ((end - start) * amount);
  }

  private ensureInterpolationAmount(value: number): number {
    if (!Number.isFinite(value)) {
      throw new Error(`Interpolation amount must be finite. Received '${value}'.`);
    }

    if (value < 0 || value > 1) {
      throw new Error(`Interpolation amount must be in range [0..1]. Received '${value}'.`);
    }

    return value;
  }
}