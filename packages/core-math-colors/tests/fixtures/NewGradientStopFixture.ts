import { HslColor, NewGradientStop } from "../../src/index.js";

export class NewGradientStopFixture {
    public createAt(position: number, color: HslColor = this.createColorA()): NewGradientStop<HslColor> {
        return NewGradientStop.create(position, color);
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
