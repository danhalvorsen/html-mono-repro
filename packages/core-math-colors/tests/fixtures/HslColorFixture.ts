// ====================================================================================
// FILE: packages/core-math-colors/tests/fixtures/NewPaletteFixture.ts
// ====================================================================================
import { HslColor } from "../../src/index.js";


export class HslColorFixture {
    public create(): HslColor {
        return HslColor.fromNormalized(0.25, 0.5, 0.75, 1);
    }

    public createCloneSource(): HslColor {
        return HslColor.fromNormalized(0.1, 0.2, 0.3, 0.4);
    }

    public createEqualLeft(): HslColor {
        return HslColor.fromNormalized(0.2, 0.3, 0.4, 0.5);
    }

    public createEqualRight(): HslColor {
        return HslColor.fromNormalized(0.2, 0.3, 0.4, 0.5);
    }

    public createDifferent(): HslColor {
        return HslColor.fromNormalized(0.21, 0.3, 0.4, 0.5);
    }
}
