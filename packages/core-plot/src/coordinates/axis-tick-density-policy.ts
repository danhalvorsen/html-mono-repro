import { AxisRange } from "./axis-range.js";

const NICE_STEPS = [1, 2, 5];

export class AxisTickDensityPolicy {
  public buildVisibleTickValues(
    range: AxisRange,
    pixelLength: number,
    minimumLabelSpacing = 44,
  ): readonly number[] {
    const step = this.selectMajorStep(range, pixelLength, minimumLabelSpacing);
    const start = Math.ceil(range.min / step) * step;
    const values: number[] = [];

    for (let value = start; value <= range.max + 1e-9; value += step) {
      values.push(Math.round(value * 1000000) / 1000000);
    }

    return values;
  }

  public selectMajorStep(
    range: AxisRange,
    pixelLength: number,
    minimumLabelSpacing = 44,
  ): number {
    const unitsPerMinimumLabel = (range.span() / pixelLength) * minimumLabelSpacing;
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(unitsPerMinimumLabel, 1e-9))));

    for (const multiplier of NICE_STEPS) {
      const candidate = multiplier * magnitude;
      const pixelsPerStep = (candidate / range.span()) * pixelLength;
      if (pixelsPerStep >= minimumLabelSpacing) {
        return candidate;
      }
    }

    return 10 * magnitude;
  }
}
