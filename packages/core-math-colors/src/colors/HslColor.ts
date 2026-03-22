// packages/core-math-colors/src/colors/HslColor.ts

import type { IHslColor } from "./IHslColor.js";

export class HslColor implements IHslColor {
  public readonly hue: number;
  public readonly saturation: number;
  public readonly lightness: number;
  public readonly alpha: number;

  private constructor(
    hue: number,
    saturation: number,
    lightness: number,
    alpha: number,
  ) {
    this.hue = HslColor.ensureUnit(hue, "hue");
    this.saturation = HslColor.ensureUnit(saturation, "saturation");
    this.lightness = HslColor.ensureUnit(lightness, "lightness");
    this.alpha = HslColor.ensureUnit(alpha, "alpha");
  }

  public static fromNormalized(
    hue: number,
    saturation: number,
    lightness: number,
    alpha: number = 1,
  ): HslColor {
    return new HslColor(hue, saturation, lightness, alpha);
  }

  public equals(other: IHslColor): boolean {
    return (
      this.hue === other.hue &&
      this.saturation === other.saturation &&
      this.lightness === other.lightness &&
      this.alpha === other.alpha
    );
  }

  public clone(): HslColor {
    return new HslColor(
      this.hue,
      this.saturation,
      this.lightness,
      this.alpha,
    );
  }

  private static ensureUnit(value: number, name: string): number {
    if (!Number.isFinite(value)) {
      throw new Error(`HSL component '${name}' must be finite. Received '${value}'.`);
    }

    if (value < 0 || value > 1) {
      throw new Error(`HSL component '${name}' must be in range [0..1]. Received '${value}'.`);
    }

    return value;
  }
}