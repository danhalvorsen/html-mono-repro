import type { IRgbaToHeightConverter } from "./IRgbaToHeightConverter.js";
import type { RgbaColor } from "./RgbaColor.js";

export class LuminanceRgbaToHeightConverter implements IRgbaToHeightConverter {
  public convert(color: RgbaColor): number {
    this.assertByte(color.red);
    this.assertByte(color.green);
    this.assertByte(color.blue);

    return (
      color.red * 0.2126 +
      color.green * 0.7152 +
      color.blue * 0.0722
    ) / 255;
  }

  private assertByte(value: number): void {
    if (!Number.isFinite(value) || value < 0 || value > 255) {
      throw new Error(`RGBA byte value is outside [0, 255]: ${value}`);
    }
  }
}