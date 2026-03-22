import { ClampRangeBehavior, NewHslColorInterpolationSpace, NewPalette }
from '../../src/index.js';
import { HslColor   } from '../../src/colors/HslColor.js';
 
import { NewPaletteColorInterpolator } from '../../src/interpolation/NewPaletteColorInterpolator.js';
 
export class NewPaletteColorInterpolatorFixture {
    public createSut(): NewPaletteColorInterpolator<HslColor> {
        return new NewPaletteColorInterpolator<HslColor>(
            this.createPalette(),
            new ClampRangeBehavior(),
            new NewHslColorInterpolationSpace()
        );
    }

    public createSingleColorSut(): NewPaletteColorInterpolator<HslColor> {
        return new NewPaletteColorInterpolator<HslColor>(
            NewPalette.create([this.createColorA()]),
            new ClampRangeBehavior(),
            new NewHslColorInterpolationSpace()
        );
    }

    public createPalette(): NewPalette<HslColor> {
        return NewPalette.create([
            this.createColorA(),
            this.createColorB(),
            this.createColorC(),
        ]);
    }

    public createColorA(): HslColor {
        return HslColor.fromNormalized(0, 1, 0.5, 1);
    }

    public createColorB(): HslColor {
        return HslColor.fromNormalized(1 / 3, 1, 0.5, 1);
    }

    public createColorC(): HslColor {
        return HslColor.fromNormalized(2 / 3, 1, 0.5, 1);
    }
}
