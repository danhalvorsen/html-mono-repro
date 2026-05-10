import {
  ClampRangeBehavior,
  HslColor,
  NewGradient,
  NewGradientStop,
  NewGradientStopInterpolator,
  NewHslColorInterpolationSpace,
  NewPalette,
  NewPaletteColorInterpolator,
  WrapRangeBehavior,
  type INewColorInterpolator,
} from "@monorepo/core-math-colors";
import { ColorMangmentMode, type ColorMangmentModeValue } from "./ColorMangmentMode.js";
import { ColorMangmentPresetName, type ColorMangmentPresetNameValue } from "./ColorMangmentPresetName.js";

export interface ColorMangmentColorSourceOptions {
  readonly mode: ColorMangmentModeValue;
  readonly preset: ColorMangmentPresetNameValue;
  readonly seed: number;
  readonly paletteCount: number;
}

export class ColorMangmentColorSourceFactory {
  public create(
    options: ColorMangmentColorSourceOptions,
  ): INewColorInterpolator<HslColor> {
    if (options.mode === ColorMangmentMode.RandomPalette) {
      return new NewPaletteColorInterpolator(
        this.createRandomPalette(options.seed, options.paletteCount),
        new WrapRangeBehavior(),
        new NewHslColorInterpolationSpace(),
      );
    }

    if (options.mode === ColorMangmentMode.Palette) {
      return new NewPaletteColorInterpolator(
        this.createPresetPalette(options.preset),
        new WrapRangeBehavior(),
        new NewHslColorInterpolationSpace(),
      );
    }

    return new NewGradientStopInterpolator(
      this.createPresetGradient(options.preset),
      new ClampRangeBehavior(),
      new NewHslColorInterpolationSpace(),
    );
  }

  private createPresetGradient(
    preset: ColorMangmentPresetNameValue,
  ): NewGradient<HslColor> {
    if (preset === ColorMangmentPresetName.Ocean) {
      return NewGradient.create(
        [
          NewGradientStop.create(0, HslColor.fromNormalized(0.55, 0.95, 0.18, 1)),
          NewGradientStop.create(0.45, HslColor.fromNormalized(0.52, 0.9, 0.42, 1)),
          NewGradientStop.create(1, HslColor.fromNormalized(0.47, 0.8, 0.7, 1)),
        ],
        "ocean",
      );
    }

    if (preset === ColorMangmentPresetName.Heat) {
      return NewGradient.create(
        [
          NewGradientStop.create(0, HslColor.fromNormalized(0.02, 1, 0.2, 1)),
          NewGradientStop.create(0.42, HslColor.fromNormalized(0.08, 1, 0.5, 1)),
          NewGradientStop.create(0.72, HslColor.fromNormalized(0.14, 1, 0.62, 1)),
          NewGradientStop.create(1, HslColor.fromNormalized(0.0, 0, 0.95, 1)),
        ],
        "heat",
      );
    }

    if (preset === ColorMangmentPresetName.Mono) {
      return NewGradient.create(
        [
          NewGradientStop.create(0, HslColor.fromNormalized(0, 0, 0.12, 1)),
          NewGradientStop.create(0.5, HslColor.fromNormalized(0, 0, 0.55, 1)),
          NewGradientStop.create(1, HslColor.fromNormalized(0, 0, 0.92, 1)),
        ],
        "mono",
      );
    }

    return NewGradient.create(
      [
        NewGradientStop.create(0, HslColor.fromNormalized(0.6, 1, 0.56, 1)),
        NewGradientStop.create(0.35, HslColor.fromNormalized(0.78, 0.95, 0.62, 1)),
        NewGradientStop.create(0.65, HslColor.fromNormalized(0.92, 1, 0.6, 1)),
        NewGradientStop.create(1, HslColor.fromNormalized(0.13, 1, 0.62, 1)),
      ],
      "neon-flow",
    );
  }

  private createPresetPalette(
    preset: ColorMangmentPresetNameValue,
  ): NewPalette<HslColor> {
    const gradient = this.createPresetGradient(preset);

    return NewPalette.create(
      gradient.getAll().map((stop) => stop.color),
    );
  }

  private createRandomPalette(
    seed: number,
    count: number,
  ): NewPalette<HslColor> {
    if (!Number.isInteger(seed)) {
      throw new RangeError("seed must be an integer.");
    }

    if (!Number.isInteger(count) || count < 2 || count > 32) {
      throw new RangeError("paletteCount must be an integer in range [2..32].");
    }

    let state = seed >>> 0;

    const random = (): number => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0x100000000;
    };

    return NewPalette.create(
      Array.from({ length: count }, () =>
        HslColor.fromNormalized(
          random(),
          0.72 + random() * 0.28,
          0.42 + random() * 0.28,
          1,
        ),
      ),
    );
  }
}