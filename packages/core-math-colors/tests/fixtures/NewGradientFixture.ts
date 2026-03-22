// ====================================================================================
// FILE: packages/core-math-colors/tests/fixtures/NewGradientFixture.ts
// ====================================================================================
import { NewGradient } from "../../src/index.js";
// ====================================================================================
// FILE: packages/core-math-colors/tests/fixtures/NewPaletteFixture.ts
// ====================================================================================
import { HslColor } from "../../src/index.js";
// ====================================================================================
// FILE: packages/core-math-colors/tests/fixtures/NewGradientStopFixture.ts
// ====================================================================================
import { NewGradientStop } from "../../src/index.js";


export class NewGradientFixture {
    public createSingleGradient(): NewGradient<HslColor> {
        return NewGradient.create([
            NewGradientStop.create(0, this.createColorA()),
        ], "single-gradient");
    }

    public createGradient(): NewGradient<HslColor> {
        return NewGradient.create([
            NewGradientStop.create(0, this.createColorA()),
            NewGradientStop.create(0.5, this.createColorB()),
            NewGradientStop.create(1, this.createColorC()),
        ], "fixture-gradient");
    }

    public createUnorderedGradient(): NewGradient<HslColor> {
        return NewGradient.create([
            NewGradientStop.create(1, this.createColorC()),
            NewGradientStop.create(0, this.createColorA()),
            NewGradientStop.create(0.5, this.createColorB()),
        ], "unordered-gradient");
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
