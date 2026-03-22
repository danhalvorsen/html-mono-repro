
import {
  ClampRangeBehavior,
  WrapRangeBehavior,
  MirrorRangeBehavior,

  Color,
  HslColor,

  NewPalette,
  NewGradient,
  NewGradientStop,

  NewPaletteColorInterpolator,
  NewGradientStopInterpolator,
  NewHslColorInterpolationSpace,

  RgbToHslColorConverter,
  HslToRgbColorConverter,
} from "../../src/index.js";

export class Fixture {
  private readonly rgbToHsl = new RgbToHslColorConverter();
  private readonly hslToRgb = new HslToRgbColorConverter();

  // --------------------------------------------------------------------------------
  // COLOR
  // --------------------------------------------------------------------------------

  public color(hex: string): Color {
    return Color.fromHex(hex);
  }

  public hsl(hex: string): HslColor {
    return this.rgbToHsl.convert(this.color(hex));
  }

  public toRgb(color: HslColor): Color {
    return this.hslToRgb.convert(color);
  }

  // --------------------------------------------------------------------------------
  // NEW PALETTE
  // --------------------------------------------------------------------------------

  public newPalette(hexColors: readonly string[]): NewPalette<HslColor> {
    return NewPalette.create(
      hexColors.map((hex) => this.hsl(hex)),
    );
  }

  // --------------------------------------------------------------------------------
  // NEW GRADIENT
  // --------------------------------------------------------------------------------

  public newGradient(
    stops: ReadonlyArray<readonly [number, string]>,
    name: string = "gradient",
  ): NewGradient<HslColor> {
    return NewGradient.create(
      stops.map(([position, hex]) =>
        NewGradientStop.create(position, this.hsl(hex)),
      ),
      name,
    );
  }

  // --------------------------------------------------------------------------------
  // RANGE
  // --------------------------------------------------------------------------------

  public clamp(): ClampRangeBehavior {
    return new ClampRangeBehavior();
  }

  public wrap(): WrapRangeBehavior {
    return new WrapRangeBehavior();
  }

  public mirror(): MirrorRangeBehavior {
    return new MirrorRangeBehavior();
  }

  // --------------------------------------------------------------------------------
  // INTERPOLATION
  // --------------------------------------------------------------------------------

  public hslSpace(): NewHslColorInterpolationSpace {
    return new NewHslColorInterpolationSpace();
  }

  public newPaletteInterpolator(
    hexColors: readonly string[],
  ): NewPaletteColorInterpolator<HslColor> {
    return new NewPaletteColorInterpolator(
      this.newPalette(hexColors),
      this.clamp(),
      this.hslSpace(),
    );
  }

  public newGradientInterpolator(
    stops: ReadonlyArray<readonly [number, string]>,
  ): NewGradientStopInterpolator<HslColor> {
    return new NewGradientStopInterpolator(
      this.newGradient(stops),
      this.clamp(),
      this.hslSpace(),
    );
  }
}