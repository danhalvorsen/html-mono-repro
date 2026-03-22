// ====================================================================================
// FILE: packages/core-math-colors/tests/fixtures/ColorConversionFixture.ts
// ====================================================================================
import {
    Color, HslToRgbColorConverter,
    RgbToHslColorConverter
} from "../../src/index.js";
// ====================================================================================
// FILE: packages/core-math-colors/tests/fixtures/NewPaletteFixture.ts
// ====================================================================================
import { HslColor } from "../../src/index.js";


export class ColorConversionFixture {
    public readonly rgbToHsl: RgbToHslColorConverter;
    public readonly hslToRgb: HslToRgbColorConverter;

    public constructor() {
        this.rgbToHsl = new RgbToHslColorConverter();
        this.hslToRgb = new HslToRgbColorConverter();
    }

    public createRedRgb(): Color {
        return Color.fromRgbBytes(255, 0, 0);
    }

    public createGreenRgb(): Color {
        return Color.fromRgbBytes(0, 255, 0);
    }

    public createBlueRgb(): Color {
        return Color.fromRgbBytes(0, 0, 255);
    }

    public createGrayRgb(): Color {
        return Color.fromRgbBytes(128, 128, 128);
    }

    public createRoundtripRgb(): Color {
        return Color.fromRgbBytes(64, 128, 192, 0.75);
    }

    public createRedHsl(): HslColor {
        return HslColor.fromNormalized(0, 1, 0.5, 1);
    }

    public createGreenHsl(): HslColor {
        return HslColor.fromNormalized(1 / 3, 1, 0.5, 1);
    }

    public createBlueHsl(): HslColor {
        return HslColor.fromNormalized(2 / 3, 1, 0.5, 1);
    }

    public createGrayHsl(): HslColor {
        return HslColor.fromNormalized(0, 0, 128 / 255, 1);
    }
}
