// ====================================================================================
// FILE: src/interpolation/RgbColorInterpolationSpace.ts
// ====================================================================================

import { Color } from "../colors/Color.js";
import type { IColorInterpolationSpace } from "./IColorInterpolationSpace.js";

/**
 * IMPORTANT:
 * This implementation MUST match the method name defined in
 * IColorInterpolationSpace.
 *
 * If your interface currently uses:
 *   interpolateTemplate(...)
 * then rename this method accordingly.
 *
 * Recommended canonical name:
 *   interpolate(...)
 */
export class RgbColorInterpolationSpace implements IColorInterpolationSpace {
  public interpolate(start: Color, end: Color, amount: number): Color {
    const t = this.ensureUnitInterval(amount);

    return Color.fromNormalized(
      this.lerp(start.red, end.red, t),
      this.lerp(start.green, end.green, t),
      this.lerp(start.blue, end.blue, t),
      this.lerp(start.alpha, end.alpha, t),
    );
  }

  private lerp(a: number, b: number, t: number): number {
    return a + ((b - a) * t);
  }

  private ensureUnitInterval(value: number): number {
    if (!Number.isFinite(value)) {
      throw new Error(`Interpolation amount must be finite. Received '${value}'.`);
    }

    if (value < 0 || value > 1) {
      throw new Error(`Interpolation amount must be in range [0..1]. Received '${value}'.`);
    }

    return value;
  }
}