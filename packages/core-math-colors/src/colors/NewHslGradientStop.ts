// packages/core-math-colors/src/gradients/NewHslGradientStop.ts

import { HslColor } from "../colors/HslColor.js";

export class NewHslGradientStop {
  public readonly position: number;
  public readonly color: HslColor;

  private constructor(position: number, color: HslColor) {
    this.position = NewHslGradientStop.ensurePosition(position);
    this.color = color;
  }

  public static create(position: number, color: HslColor): NewHslGradientStop {
    return new NewHslGradientStop(position, color);
  }

  private static ensurePosition(value: number): number {
    if (!Number.isFinite(value)) {
      throw new Error(`Gradient stop position must be finite. Received '${value}'.`);
    }

    if (value < 0 || value > 1) {
      throw new Error(`Gradient stop position must be in range [0..1]. Received '${value}'.`);
    }

    return value;
  }
}