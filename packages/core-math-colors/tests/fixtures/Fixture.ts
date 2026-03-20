// --- imports from your product code ---
import { ClampRangeBehavior, Gradient, GradientStop, GradientStopInterpolator, MirrorRangeBehavior, Palette, PaletteColorInterpolator, RgbColorInterpolationSpace, WrapRangeBehavior } from '../../src/index.js';
import { Color } from '../../src/index.js';

// ====================================================================================
// FIXTURE
// ====================================================================================
export class Fixture {
    public color(hex: string): Color {
        return Color.fromHex(hex);
    }

    public palette(hex: readonly string[]): Palette {
        return Palette.create(hex.map((h) => Color.fromHex(h)));
    }

    public gradient(stops: ReadonlyArray<readonly [number, string]>): Gradient {
        return Gradient.create(
            stops.map(([p, h]) => GradientStop.create(p, Color.fromHex(h)))
        );
    }

    public rgbSpace(): RgbColorInterpolationSpace {
        return new RgbColorInterpolationSpace();
    }

    public clamp(): ClampRangeBehavior {
        return new ClampRangeBehavior();
    }

    public wrap(): WrapRangeBehavior {
        return new WrapRangeBehavior();
    }

    public mirror(): MirrorRangeBehavior {
        return new MirrorRangeBehavior();
    }

    public paletteInterpolator(hex: readonly string[]): PaletteColorInterpolator {
        return new PaletteColorInterpolator(
            this.palette(hex),
            this.clamp(),
            this.rgbSpace()
        );
    }

    public gradientInterpolator(
        stops: ReadonlyArray<readonly [number, string]>
    ): GradientStopInterpolator {
        return new GradientStopInterpolator(
            this.gradient(stops),
            this.clamp(),
            this.rgbSpace()
        );
    }
}
