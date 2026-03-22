import {ClampRangeBehavior, HslColor, NewGradient, NewGradientStop, NewGradientStopInterpolator, NewHslColorInterpolationSpace} from "../../src/index.js"
export class NewGradientStopInterpolatorFixture {
    public createSut(): NewGradientStopInterpolator<HslColor> {
        return new NewGradientStopInterpolator<HslColor>(
            this.createGradient(),
            new ClampRangeBehavior(),
            new NewHslColorInterpolationSpace()
        );
    }

    public createSingleColorSut(): NewGradientStopInterpolator<HslColor> {
        return new NewGradientStopInterpolator<HslColor>(
            NewGradient.create([
                NewGradientStop.create(0.25, this.createColorA()),
            ], "single"),
            new ClampRangeBehavior(),
            new NewHslColorInterpolationSpace()
        );
    }

    public createGradient(): NewGradient<HslColor> {
        return NewGradient.create([
            NewGradientStop.create(0, this.createColorA()),
            NewGradientStop.create(0.5, this.createColorB()),
            NewGradientStop.create(1, this.createColorC()),
        ], "gradient-fixture");
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
