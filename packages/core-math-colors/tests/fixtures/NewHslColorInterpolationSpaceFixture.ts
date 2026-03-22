import { HslColor } from "../../src/colors/HslColor.js";
import { NewHslColorInterpolationSpace } from "../../src/interpolation/NewHslColorInterpolationSpace.js";

export class NewHslColorInterpolationSpaceFixture {
    public createSut(): NewHslColorInterpolationSpace {
        return new NewHslColorInterpolationSpace();
    }

    public createRed(): HslColor {
        return HslColor.fromNormalized(0, 1, 0.5, 1);
    }

    public createGreen(): HslColor {
        return HslColor.fromNormalized(1 / 3, 1, 0.5, 1);
    }

    public createBlue(): HslColor {
        return HslColor.fromNormalized(2 / 3, 1, 0.5, 1);
    }

    public createNearWrapStart(): HslColor {
        return HslColor.fromNormalized(0.95, 1, 0.5, 1);
    }

    public createNearWrapEnd(): HslColor {
        return HslColor.fromNormalized(0.05, 1, 0.5, 1);
    }
}
