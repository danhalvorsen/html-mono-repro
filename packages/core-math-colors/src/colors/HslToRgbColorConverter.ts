import { IColorConverter } from "../conversion/IColorConverter.js";
import { Color } from "./Color.js";
import { HslColor } from "./HslColor.js";
 
export class HslToRgbColorConverter implements IColorConverter<HslColor, Color> {
    public convert(source: HslColor): Color {
        const h = source.hue;
        const s = source.saturation;
        const l = source.lightness;

        if (s === 0) {
            return Color.fromNormalized(l, l, l, source.alpha);
        }

        const q = l < 0.5
            ? l * (1 + s)
            : l + s - (l * s);

        const p = (2 * l) - q;

        const r = this.hueToRgb(p, q, h + (1 / 3));
        const g = this.hueToRgb(p, q, h);
        const b = this.hueToRgb(p, q, h - (1 / 3));

        return Color.fromNormalized(r, g, b, source.alpha);
    }

    private hueToRgb(p: number, q: number, t: number): number {
        let normalized = t;

        if (normalized < 0) {
            normalized += 1;
        }

        if (normalized > 1) {
            normalized -= 1;
        }

        if (normalized < 1 / 6) {
            return p + ((q - p) * 6 * normalized);
        }

        if (normalized < 1 / 2) {
            return q;
        }

        if (normalized < 2 / 3) {
            return p + ((q - p) * ((2 / 3) - normalized) * 6);
        }

        return p;
    }
}
