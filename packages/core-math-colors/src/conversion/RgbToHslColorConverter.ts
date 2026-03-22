 
import { Color } from "../colors/Color.js";
import { HslColor } from "../colors/HslColor.js";
import type { IColorConverter } from "./IColorConverter.js";

export class RgbToHslColorConverter implements IColorConverter<Color, HslColor> {
    public convert(source: Color): HslColor {
        const r = source.red;
        const g = source.green;
        const b = source.blue;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const chroma = max - min;
        const lightness = (max + min) / 2;

        if (chroma === 0) {
            return HslColor.fromNormalized(0, 0, lightness, source.alpha);
        }

        const saturation = lightness === 0 || lightness === 1
            ? 0
            : chroma / (1 - Math.abs((2 * lightness) - 1));

        let hueSector = 0;

        if (max === r) {
            hueSector = ((g - b) / chroma) % 6;
        } else if (max === g) {
            hueSector = ((b - r) / chroma) + 2;
        } else {
            hueSector = ((r - g) / chroma) + 4;
        }

        const hue = ((hueSector * 60) + 360) % 360;

        return HslColor.fromNormalized(
            hue / 360,
            saturation,
            lightness,
            source.alpha
        );
    }
}
