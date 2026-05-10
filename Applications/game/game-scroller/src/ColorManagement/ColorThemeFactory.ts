import { Color, HslColor } from "@monorepo/core-math-colors";
import { HslToRgbColorConverter } from "@monorepo/core-math-colors";
import type { GameObjectColorStop, GameObjectColorTheme } from "./IColorManagedGameObject.js";
import type { ColorThemePreset } from "./ColorThemePreset.js";

export interface IColorThemeFactory {
  create(preset: ColorThemePreset, seed: number): GameObjectColorTheme;
}

export class ColorThemeFactory implements IColorThemeFactory {
  readonly #converter = new HslToRgbColorConverter();

  public create(preset: ColorThemePreset, seed: number): GameObjectColorTheme {
    switch (preset) {
      case "aurora":
        return this.createFixed(
          "aurora",
          "#06131A",
          [
            this.stop(0.00, 0.53, 0.90, 0.62),
            this.stop(0.35, 0.61, 0.88, 0.60),
            this.stop(0.70, 0.78, 0.86, 0.62),
            this.stop(1.00, 0.92, 0.92, 0.64),
          ],
          0.95,
        );

      case "ember":
        return this.createFixed(
          "ember",
          "#120909",
          [
            this.stop(0.00, 0.02, 0.92, 0.56),
            this.stop(0.40, 0.08, 0.95, 0.56),
            this.stop(0.75, 0.13, 0.96, 0.62),
            this.stop(1.00, 0.18, 1.00, 0.72),
          ],
          0.96,
        );

      case "ocean":
        return this.createFixed(
          "ocean",
          "#071018",
          [
            this.stop(0.00, 0.50, 0.88, 0.54),
            this.stop(0.30, 0.57, 0.86, 0.52),
            this.stop(0.65, 0.63, 0.84, 0.56),
            this.stop(1.00, 0.71, 0.82, 0.60),
          ],
          0.94,
        );

      case "mono":
        return this.createFixed(
          "mono",
          "#000000",
          [
            this.stop(0.00, 0.00, 0.00, 0.10),
            this.stop(0.20, 0.00, 0.00, 0.28),
            this.stop(0.75, 0.00, 0.00, 0.85),
            this.stop(1.00, 0.00, 0.00, 1.00),
          ],
          0.96,
        );

      case "random":
        return this.createRandom(seed);
    }
  }

  private createFixed(
    name: string,
    backgroundCss: string,
    stops: readonly GameObjectColorStop[],
    opacity: number,
  ): GameObjectColorTheme {
    const paletteCss = stops.map(stop => stop.colorCss);
    const foregroundCss = paletteCss[paletteCss.length - 1] ?? "#ffffff";
    const accentCss = paletteCss[Math.floor(paletteCss.length / 2)] ?? foregroundCss;
    const shadowCss = Color.fromHex(backgroundCss).toCssRgba();

    return {
      name,
      backgroundCss,
      foregroundCss,
      accentCss,
      shadowCss,
      opacity,
      gradientStops: stops,
      paletteCss,
    };
  }

  private createRandom(seed: number): GameObjectColorTheme {
    let state = seed >>> 0;

    const random = (): number => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0x100000000;
    };

    const baseHue = random();
    const hueStep = 0.12 + (random() * 0.16);

    const stops = [
      this.stop(0.00, baseHue, 0.85, 0.45 + random() * 0.12),
      this.stop(0.33, (baseHue + hueStep) % 1, 0.88, 0.50 + random() * 0.12),
      this.stop(0.66, (baseHue + (hueStep * 2)) % 1, 0.90, 0.58 + random() * 0.10),
      this.stop(1.00, (baseHue + (hueStep * 3)) % 1, 0.92, 0.66 + random() * 0.08),
    ] as const;

    const background = this.#converter
      .convert(HslColor.fromNormalized(baseHue, 0.45, 0.08, 1))
      .toHexRgb();

    return this.createFixed("random", background, stops, 0.95);
  }

  private stop(position: number, hue: number, saturation: number, lightness: number): GameObjectColorStop {
    const colorCss = this.#converter
      .convert(HslColor.fromNormalized(hue, saturation, lightness, 1))
      .toCssRgba();

    return {
      position,
      colorCss,
    };
  }
}