// packages/core-math-colors/src/interpolation/NewHslColorInterpolationSpace.ts

import { HslColor } from "../colors/HslColor.js";
import type { INewColorInterpolationSpace } from "./INewColorInterpolationSpace.js";

export class NewHslColorInterpolationSpace implements INewColorInterpolationSpace<HslColor> {
  private static readonly EPSILON = 1e-12;

  public interpolate(start: HslColor, end: HslColor, amount: number): HslColor {
    const t = this.ensureUnitInterval(amount);

    return HslColor.fromNormalized(
      this.interpolateHue(start.hue, end.hue, t),
      this.lerp(start.saturation, end.saturation, t),
      this.lerp(start.lightness, end.lightness, t),
      this.lerp(start.alpha, end.alpha, t),
    );
  }

  private lerp(start: number, end: number, amount: number): number {
    return start + ((end - start) * amount);
  }

  private interpolateHue(start: number, end: number, amount: number): number {
    let delta = end - start;

    if (delta > 0.5) {
      delta -= 1;
    } else if (delta < -0.5) {
      delta += 1;
    }

    const value = start + (delta * amount);

    return this.normalizeHue(value);
  }

  private normalizeHue(value: number): number {
    let normalized = value % 1;

    if (normalized < 0) {
      normalized += 1;
    }

    if (Math.abs(normalized) <= NewHslColorInterpolationSpace.EPSILON) {
      return 0;
    }

    if (Math.abs(1 - normalized) <= NewHslColorInterpolationSpace.EPSILON) {
      return 0;
    }

    return normalized;
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