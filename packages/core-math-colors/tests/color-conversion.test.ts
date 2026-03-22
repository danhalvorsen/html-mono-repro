
// ====================================================================================
// FILE: packages/core-math-colors/tests/color-conversion.test.ts
// ====================================================================================

import { describe, expect, it } from "vitest";
import { ColorConversionFixture } from "./fixtures/ColorConversionFixture.js";

describe("Color conversion", () => {
  const fixture = new ColorConversionFixture();

  it("should convert rgb red to hsl", () => {
    const source = fixture.createRedRgb();

    const result = fixture.rgbToHsl.convert(source);

    expect(result.hue).toBeCloseTo(0, 6);
    expect(result.saturation).toBeCloseTo(1, 6);
    expect(result.lightness).toBeCloseTo(0.5, 6);
    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should convert rgb green to hsl", () => {
    const source = fixture.createGreenRgb();

    const result = fixture.rgbToHsl.convert(source);

    expect(result.hue).toBeCloseTo(1 / 3, 6);
    expect(result.saturation).toBeCloseTo(1, 6);
    expect(result.lightness).toBeCloseTo(0.5, 6);
    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should convert rgb blue to hsl", () => {
    const source = fixture.createBlueRgb();

    const result = fixture.rgbToHsl.convert(source);

    expect(result.hue).toBeCloseTo(2 / 3, 6);
    expect(result.saturation).toBeCloseTo(1, 6);
    expect(result.lightness).toBeCloseTo(0.5, 6);
    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should convert gray rgb to hsl with zero saturation", () => {
    const source = fixture.createGrayRgb();

    const result = fixture.rgbToHsl.convert(source);

    expect(result.hue).toBeCloseTo(0, 6);
    expect(result.saturation).toBeCloseTo(0, 6);
    expect(result.lightness).toBeCloseTo(128 / 255, 6);
    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should convert hsl red to rgb", () => {
    const source = fixture.createRedHsl();

    const result = fixture.hslToRgb.convert(source);

    expect(result.red).toBeCloseTo(1, 6);
    expect(result.green).toBeCloseTo(0, 6);
    expect(result.blue).toBeCloseTo(0, 6);
    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should convert hsl green to rgb", () => {
    const source = fixture.createGreenHsl();

    const result = fixture.hslToRgb.convert(source);

    expect(result.red).toBeCloseTo(0, 6);
    expect(result.green).toBeCloseTo(1, 6);
    expect(result.blue).toBeCloseTo(0, 6);
    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should convert hsl blue to rgb", () => {
    const source = fixture.createBlueHsl();

    const result = fixture.hslToRgb.convert(source);

    expect(result.red).toBeCloseTo(0, 6);
    expect(result.green).toBeCloseTo(0, 6);
    expect(result.blue).toBeCloseTo(1, 6);
    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should convert hsl gray to rgb", () => {
    const source = fixture.createGrayHsl();

    const result = fixture.hslToRgb.convert(source);

    expect(result.red).toBeCloseTo(128 / 255, 6);
    expect(result.green).toBeCloseTo(128 / 255, 6);
    expect(result.blue).toBeCloseTo(128 / 255, 6);
    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should roundtrip rgb to hsl to rgb", () => {
    const source = fixture.createRoundtripRgb();

    const hsl = fixture.rgbToHsl.convert(source);
    const result = fixture.hslToRgb.convert(hsl);

    expect(result.red).toBeCloseTo(source.red, 6);
    expect(result.green).toBeCloseTo(source.green, 6);
    expect(result.blue).toBeCloseTo(source.blue, 6);
    expect(result.alpha).toBeCloseTo(source.alpha, 6);
  });

  it("should roundtrip hsl to rgb to hsl", () => {
    const source = fixture.createBlueHsl();

    const rgb = fixture.hslToRgb.convert(source);
    const result = fixture.rgbToHsl.convert(rgb);

    expect(result.hue).toBeCloseTo(source.hue, 6);
    expect(result.saturation).toBeCloseTo(source.saturation, 6);
    expect(result.lightness).toBeCloseTo(source.lightness, 6);
    expect(result.alpha).toBeCloseTo(source.alpha, 6);
  });
});