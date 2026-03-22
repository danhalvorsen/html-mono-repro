
import { describe, expect, it } from "vitest";
import {ClampRangeBehavior, HslColor, NewGradient, NewGradientStop, NewGradientStopInterpolator, NewHslColorInterpolationSpace} from "../src/index.js"
import { NewPaletteColorInterpolatorFixture } from "./fixtures/NewPaletteColorInterpolatorFixture.js";

describe("NewPaletteColorInterpolator", () => {
  const fixture = new NewPaletteColorInterpolatorFixture();

  it("should return first color", () => {
    const sut = fixture.createSut();

    const result = sut.sample(0);

    expect(result.equals(fixture.createColorA())).toBe(true);
  });

  it("should return last color", () => {
    const sut = fixture.createSut();

    const result = sut.sample(1);

    expect(result.equals(fixture.createColorC())).toBe(true);
  });

  it("should interpolate inside first segment", () => {
    const sut = fixture.createSut();

    const result = sut.sample(0.25);

    expect(result.hue).toBeCloseTo(1 / 6, 6);
    expect(result.saturation).toBeCloseTo(1, 6);
    expect(result.lightness).toBeCloseTo(0.5, 6);
    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should clamp outside range", () => {
    const sut = fixture.createSut();

    expect(sut.sample(-1).equals(fixture.createColorA())).toBe(true);
    expect(sut.sample(2).equals(fixture.createColorC())).toBe(true);
  });

  it("should sample many", () => {
    const sut = fixture.createSut();

    const result = sut.sampleMany([0, 0.5, 1]);

    expect(result).toHaveLength(3);
    expect(result[0]?.equals(fixture.createColorA())).toBe(true);
    expect(result[1]?.equals(fixture.createColorB())).toBe(true);
    expect(result[2]?.equals(fixture.createColorC())).toBe(true);
  });

  it("should return only color for single-sample palette", () => {
    const sut = fixture.createSingleColorSut();

    const result = sut.sample(0.5);

    expect(result.equals(fixture.createColorA())).toBe(true);
  });
});
