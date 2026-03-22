// ====================================================================================
// FILE: tests/all-major-abstractions.spec.ts
// PURPOSE:
// - Single copy/paste test file
// - Covers all major abstractions through their interfaces + concrete implementations
// - Assumes your product code already exists in ../src/**
//
// COVERED ABSTRACTIONS
// - IColor                  -> Color
// - IPalette                -> Palette
// - IRangeBehavior          -> ClampRangeBehavior / WrapRangeBehavior / MirrorRangeBehavior
// - IColorInterpolationSpace-> RgbColorInterpolationSpace
// - IColorInterpolator      -> PaletteColorInterpolator / GradientStopInterpolator
// - GradientStop / Gradient
// ====================================================================================

import { describe, expect, it } from "vitest";
 
import { Gradient } from "../src/gradients/Gradient.js";
import { GradientStop } from "../src/gradients/GradientStop.js";

import type { IRangeBehavior } from "../src/range/IRangeBehavior.js";
import { ClampRangeBehavior } from "../src/range/ClampRangeBehavior.js";
import { WrapRangeBehavior } from "../src/range/WrapRangeBehavior.js";
import { MirrorRangeBehavior } from "../src/range/MirrorRangeBehavior.js";

import type { IColorInterpolationSpace } from "../src/interpolation/IColorInterpolationSpace.js";
import { RgbColorInterpolationSpace } from "../src/interpolation/RgbColorInterpolationSpace.js";

import type { IColorInterpolator } from "../src/interpolation/IColorInterpolator.js";
import { PaletteColorInterpolator } from "../src/interpolation/PaletteColorInterpolator.js";
import { GradientStopInterpolator } from "../src/interpolation/GradientStopInterpolator.js";
import { Color, IColor, Palette, IPalette } from "../src/index.js";

// ====================================================================================
// FIXTURE
// ====================================================================================

class ColorInterpolationFixture {
  public createColor(hex: string): IColor {
    return Color.fromHex(hex);
  }

  public createOpaqueRed(): IColor {
    return Color.fromHex("#FF0000");
  }

  public createOpaqueGreen(): IColor {
    return Color.fromHex("#00FF00");
  }

  public createOpaqueBlue(): IColor {
    return Color.fromHex("#0000FF");
  }

  public createTransparentRed(): IColor {
    return Color.fromHex("#FF000000");
  }

  public createOpaqueRedWithAlpha(): IColor {
    return Color.fromHex("#FF0000FF");
  }

  public createPalette(hexColors: readonly string[]): IPalette {
    return Palette.create(hexColors.map((hex) => Color.fromHex(hex)));
  }

  public createGradient(
    stops: ReadonlyArray<readonly [number, string]>,
  ): Gradient {
    return Gradient.create(
      stops.map(([position, hex]) => GradientStop.create(position, Color.fromHex(hex))),
    );
  }

  public createClampRangeBehavior(): IRangeBehavior {
    return new ClampRangeBehavior();
  }

  public createWrapRangeBehavior(): IRangeBehavior {
    return new WrapRangeBehavior();
  }

  public createMirrorRangeBehavior(): IRangeBehavior {
    return new MirrorRangeBehavior();
  }

  public createRgbInterpolationSpace(): IColorInterpolationSpace {
    return new RgbColorInterpolationSpace();
  }

  public createPaletteInterpolator(hexColors: readonly string[]): IColorInterpolator {
    return new PaletteColorInterpolator(
      Palette.create(hexColors.map((hex) => Color.fromHex(hex))),
      new ClampRangeBehavior(),
      new RgbColorInterpolationSpace(),
    );
  }

  public createWrappedPaletteInterpolator(hexColors: readonly string[]): IColorInterpolator {
    return new PaletteColorInterpolator(
      Palette.create(hexColors.map((hex) => Color.fromHex(hex))),
      new WrapRangeBehavior(),
      new RgbColorInterpolationSpace(),
    );
  }

  public createMirroredPaletteInterpolator(hexColors: readonly string[]): IColorInterpolator {
    return new PaletteColorInterpolator(
      Palette.create(hexColors.map((hex) => Color.fromHex(hex))),
      new MirrorRangeBehavior(),
      new RgbColorInterpolationSpace(),
    );
  }

  public createGradientInterpolator(
    stops: ReadonlyArray<readonly [number, string]>,
  ): IColorInterpolator {
    return new GradientStopInterpolator(
      this.createGradient(stops),
      new ClampRangeBehavior(),
      new RgbColorInterpolationSpace(),
    );
  }
}

// ====================================================================================
// TESTS: IColor -> Color
// ====================================================================================

describe("IColor / Color", () => {
  const fixture = new ColorInterpolationFixture();

  it("should parse rgb hex", () => {
    const sut: IColor = fixture.createColor("#FF8000");

    expect(sut.toHexRgb()).toBe("#FF8000");
    expect(sut.alpha).toBe(1);
  });

  it("should parse rgba hex", () => {
    const sut: IColor = fixture.createColor("#33669980");

    expect(sut.toHexRgba()).toBe("#33669980");
  });

  it("should format css rgba", () => {
    const sut: IColor = fixture.createColor("#FF000080");

    expect(sut.toCssRgba()).toBe("rgb(255 0 0 / 0.502)");
  });

  it("should reject invalid hex", () => {
    expect(() => fixture.createColor("#XYZ")).toThrowError(/invalid hex color/i);
  });
});

// ====================================================================================
// TESTS: IPalette -> Palette
// ====================================================================================

describe("IPalette / Palette", () => {
  const fixture = new ColorInterpolationFixture();

  it("should expose count", () => {
    const sut: IPalette = fixture.createPalette(["#FF0000", "#00FF00", "#0000FF"]);

    expect(sut.count).toBe(3);
  });

  it("should return color by index", () => {
    const sut: IPalette = fixture.createPalette(["#FF0000", "#00FF00", "#0000FF"]);

    expect(sut.getAt(1).toHexRgb()).toBe("#00FF00");
  });

  it("should return a defensive copy from getAll", () => {
    const sut: IPalette = fixture.createPalette(["#FF0000", "#00FF00"]);

    const values = [...sut.getAll()];
    values.pop();

    expect(values.length).toBe(1);
    expect(sut.getAll().length).toBe(2);
  });

  it("should reject empty palette", () => {
    expect(() => Palette.create([])).toThrowError(/at least one sample|must contain at least one sample/i);
  });

  it("should reject negative index", () => {
    const sut: IPalette = fixture.createPalette(["#FF0000"]);

    expect(() => sut.getAt(-1)).toThrowError(/out of range/i);
  });

  it("should reject non-integer index", () => {
    const sut: IPalette = fixture.createPalette(["#FF0000"]);

    expect(() => sut.getAt(0.5)).toThrowError(/integer/i);
  });

  it("should reject out-of-range index", () => {
    const sut: IPalette = fixture.createPalette(["#FF0000"]);

    expect(() => sut.getAt(1)).toThrowError(/out of range/i);
  });
});

// ====================================================================================
// TESTS: GradientStop / Gradient
// ====================================================================================

describe("GradientStop / Gradient", () => {
  const fixture = new ColorInterpolationFixture();

  it("should create a gradient stop", () => {
    const color = fixture.createOpaqueRed();
    const sut = GradientStop.create(0.25, color as Color);

    expect(sut.position).toBe(0.25);
    expect(sut.color.toHexRgb()).toBe("#FF0000");
  });

  it("should reject stop position below zero", () => {
    expect(() => GradientStop.create(-0.01, fixture.createOpaqueRed() as Color)).toThrowError(/range/i);
  });

  it("should reject stop position above one", () => {
    expect(() => GradientStop.create(1.01, fixture.createOpaqueRed() as Color)).toThrowError(/range/i);
  });

  it("should sort gradient stops", () => {
    const sut = fixture.createGradient([
      [1, "#0000FF"],
      [0, "#FF0000"],
      [0.5, "#00FF00"],
    ]);

    expect(sut.getAt(0).position).toBe(0);
    expect(sut.getAt(1).position).toBe(0.5);
    expect(sut.getAt(2).position).toBe(1);
  });

  it("should reject duplicate stop positions", () => {
    expect(() =>
      Gradient.create([
        GradientStop.create(0.5, fixture.createOpaqueRed() as Color),
        GradientStop.create(0.5, fixture.createOpaqueGreen() as Color),
      ]),
    ).toThrowError(/duplicate|unique/i);
  });

  it("should reject empty gradient", () => {
    expect(() => Gradient.create([])).toThrowError(/at least one stop|must contain at least one stop/i);
  });
});

// ====================================================================================
// TESTS: IRangeBehavior -> Clamp / Wrap / Mirror
// ====================================================================================

describe("IRangeBehavior / ClampRangeBehavior", () => {
  const fixture = new ColorInterpolationFixture();

  it("should clamp below zero", () => {
    const sut: IRangeBehavior = fixture.createClampRangeBehavior();

    expect(sut.normalize(-0.25)).toBe(0);
  });

  it("should clamp above one", () => {
    const sut: IRangeBehavior = fixture.createClampRangeBehavior();

    expect(sut.normalize(1.25)).toBe(1);
  });

  it("should keep value inside range", () => {
    const sut: IRangeBehavior = fixture.createClampRangeBehavior();

    expect(sut.normalize(0.4)).toBe(0.4);
  });
});

describe("IRangeBehavior / WrapRangeBehavior", () => {
  const fixture = new ColorInterpolationFixture();

  it("should wrap value above one", () => {
    const sut: IRangeBehavior = fixture.createWrapRangeBehavior();

    expect(sut.normalize(1.25)).toBe(0.25);
  });

  it("should wrap negative value", () => {
    const sut: IRangeBehavior = fixture.createWrapRangeBehavior();

    expect(sut.normalize(-0.2)).toBe(0.8);
  });

  it("should keep zero as zero", () => {
    const sut: IRangeBehavior = fixture.createWrapRangeBehavior();

    expect(sut.normalize(0)).toBe(0);
  });
});

describe("IRangeBehavior / MirrorRangeBehavior", () => {
  const fixture = new ColorInterpolationFixture();

  it("should mirror value between one and two", () => {
    const sut: IRangeBehavior = fixture.createMirrorRangeBehavior();

    expect(sut.normalize(1.25)).toBe(0.75);
  });

  it("should mirror value above two", () => {
    const sut: IRangeBehavior = fixture.createMirrorRangeBehavior();

    expect(sut.normalize(2.25)).toBe(0.25);
  });

  it("should mirror negative value", () => {
    const sut: IRangeBehavior = fixture.createMirrorRangeBehavior();

    expect(sut.normalize(-0.25)).toBe(0.25);
  });
});

// ====================================================================================
// TESTS: IColorInterpolationSpace -> RgbColorInterpolationSpace
// ====================================================================================

describe("IColorInterpolationSpace / RgbColorInterpolationSpace", () => {
  const fixture = new ColorInterpolationFixture();

  it("should interpolate midpoint between black and white", () => {
    const sut: IColorInterpolationSpace = fixture.createRgbInterpolationSpace();

    const actual = sut.interpolate(
      fixture.createColor("#000000") as Color,
      fixture.createColor("#FFFFFF") as Color,
      0.5,
    );

    expect(actual.toHexRgb()).toBe("#808080");
  });

  it("should interpolate alpha", () => {
    const sut: IColorInterpolationSpace = fixture.createRgbInterpolationSpace();

    const actual = sut.interpolate(
      fixture.createTransparentRed() as Color,
      fixture.createOpaqueRedWithAlpha() as Color,
      0.5,
    );

    expect(actual.toHexRgba()).toBe("#FF000080");
  });

  it("should reject interpolation amount below zero", () => {
    const sut: IColorInterpolationSpace = fixture.createRgbInterpolationSpace();

    expect(() =>
      sut.interpolate(
        fixture.createColor("#000000") as Color,
        fixture.createColor("#FFFFFF") as Color,
        -0.1,
      ),
    ).toThrowError(/range|amount/i);
  });

  it("should reject interpolation amount above one", () => {
    const sut: IColorInterpolationSpace = fixture.createRgbInterpolationSpace();

    expect(() =>
      sut.interpolate(
        fixture.createColor("#000000") as Color,
        fixture.createColor("#FFFFFF") as Color,
        1.1,
      ),
    ).toThrowError(/range|amount/i);
  });
});

// ====================================================================================
// TESTS: IColorInterpolator -> PaletteColorInterpolator
// ====================================================================================

describe("IColorInterpolator / PaletteColorInterpolator", () => {
  const fixture = new ColorInterpolationFixture();

  it("should return first palette color at 0", () => {
    const sut: IColorInterpolator = fixture.createPaletteInterpolator(["#FF0000", "#00FF00", "#0000FF"]);

    expect(sut.sample(0).toHexRgb()).toBe("#FF0000");
  });

  it("should return last palette color at 1", () => {
    const sut: IColorInterpolator = fixture.createPaletteInterpolator(["#FF0000", "#00FF00", "#0000FF"]);

    expect(sut.sample(1).toHexRgb()).toBe("#0000FF");
  });

  it("should interpolate within correct segment", () => {
    const sut: IColorInterpolator = fixture.createPaletteInterpolator(["#FF0000", "#00FF00", "#0000FF"]);

    expect(sut.sample(0.25).toHexRgb()).toBe("#808000");
  });

  it("should clamp below zero with clamp range behavior", () => {
    const sut: IColorInterpolator = fixture.createPaletteInterpolator(["#FF0000", "#00FF00"]);

    expect(sut.sample(-5).toHexRgb()).toBe("#FF0000");
  });

  it("should clamp above one with clamp range behavior", () => {
    const sut: IColorInterpolator = fixture.createPaletteInterpolator(["#FF0000", "#00FF00"]);

    expect(sut.sample(5).toHexRgb()).toBe("#00FF00");
  });

  it("should wrap values with wrap range behavior", () => {
    const sut: IColorInterpolator = fixture.createWrappedPaletteInterpolator(["#000000", "#FFFFFF"]);

    expect(sut.sample(1.25).toHexRgb()).toBe("#404040");
  });

  it("should mirror values with mirror range behavior", () => {
    const sut: IColorInterpolator = fixture.createMirroredPaletteInterpolator(["#000000", "#FFFFFF"]);

    expect(sut.sample(1.25).toHexRgb()).toBe("#BFBFBF");
  });

  it("should sample many values deterministically", () => {
    const sut: IColorInterpolator = fixture.createPaletteInterpolator(["#000000", "#FFFFFF"]);

    const actual = sut.sampleMany([0, 0.5, 1]).map((color) => color.toHexRgb());

    expect(actual).toEqual(["#000000", "#808080", "#FFFFFF"]);
  });

  it("should return only sample for single-color palette", () => {
    const sut: IColorInterpolator = fixture.createPaletteInterpolator(["#123456"]);

    expect(sut.sample(0.37).toHexRgb()).toBe("#123456");
  });
});

// ====================================================================================
// TESTS: IColorInterpolator -> GradientStopInterpolator
// ====================================================================================

describe("IColorInterpolator / GradientStopInterpolator", () => {
  const fixture = new ColorInterpolationFixture();

  it("should interpolate between non-uniform gradient stops", () => {
    const sut: IColorInterpolator = fixture.createGradientInterpolator([
      [0, "#FF0000"],
      [0.2, "#00FF00"],
      [1, "#0000FF"],
    ]);

    expect(sut.sample(0.1).toHexRgb()).toBe("#808000");
  });

  it("should use correct weighted gradient segment", () => {
    const sut: IColorInterpolator = fixture.createGradientInterpolator([
      [0, "#FF0000"],
      [0.2, "#00FF00"],
      [1, "#0000FF"],
    ]);

    expect(sut.sample(0.6).toHexRgb()).toBe("#008080");
  });

  it("should return first stop color before first stop", () => {
    const sut: IColorInterpolator = fixture.createGradientInterpolator([
      [0.25, "#FF0000"],
      [1, "#0000FF"],
    ]);

    expect(sut.sample(0).toHexRgb()).toBe("#FF0000");
  });

  it("should return last stop color after last stop", () => {
    const sut: IColorInterpolator = fixture.createGradientInterpolator([
      [0, "#FF0000"],
      [0.75, "#0000FF"],
    ]);

    expect(sut.sample(1).toHexRgb()).toBe("#0000FF");
  });

  it("should return only stop color for single-stop gradient", () => {
    const sut: IColorInterpolator = fixture.createGradientInterpolator([
      [0.4, "#123456"],
    ]);

    expect(sut.sample(0.9).toHexRgb()).toBe("#123456");
  });

  it("should sample many gradient positions", () => {
    const sut: IColorInterpolator = fixture.createGradientInterpolator([
      [0, "#000000"],
      [1, "#FFFFFF"],
    ]);

    const actual = sut.sampleMany([0, 0.5, 1]).map((color) => color.toHexRgb());

    expect(actual).toEqual(["#000000", "#808080", "#FFFFFF"]);
  });
});