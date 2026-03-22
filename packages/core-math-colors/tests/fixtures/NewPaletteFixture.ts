// ====================================================================================
// FILE: packages/core-math-colors/tests/fixtures/NewPaletteFixture.ts
// ====================================================================================
import { HslColor, NewPalette } from "../../src/index.js";


export class NewPaletteFixture {
    public createSinglePalette(): NewPalette<HslColor> {
        return NewPalette.create([this.createColorA()]);
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
