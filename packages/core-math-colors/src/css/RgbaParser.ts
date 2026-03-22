// packages/core-math-colors-samples/color-math/src/RgbaParser.ts

import { IColor } from "../colors/IColor.js";
import { Color } from "../colors/Color.js";

export class RgbaParser {
  public static tryParse(input: string): IColor | null {
    const normalized = input.trim();

    if (normalized.length === 0) {
      return null;
    }

    const parts = normalized.split(/[,\s]+/).filter((part) => part.length > 0);

    if (parts.length !== 3 && parts.length !== 4) {
      return null;
    }

    const red = Number(parts[0]);
    const green = Number(parts[1]);
    const blue = Number(parts[2]);
    const alpha = parts.length === 4 ? Number(parts[3]) : 1;

    if (!Number.isFinite(red) || !Number.isFinite(green) || !Number.isFinite(blue) || !Number.isFinite(alpha)) {
      return null;
    }

    if (!Number.isInteger(red) || red < 0 || red > 255) {
      return null;
    }

    if (!Number.isInteger(green) || green < 0 || green > 255) {
      return null;
    }

    if (!Number.isInteger(blue) || blue < 0 || blue > 255) {
      return null;
    }

    if (alpha < 0 || alpha > 1) {
      return null;
    }

    return Color.fromRgbBytes(red, green, blue, alpha);
  }
}