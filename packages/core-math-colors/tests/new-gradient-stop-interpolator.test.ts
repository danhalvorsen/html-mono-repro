
describe("NewGradientStopInterpolator", () => {
  const fixture = new NewGradientStopInterpolatorFixture();

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

  it("should interpolate non-uniform stops", () => {
    const sut = fixture.createSut();

    const result = sut.sample(0.25);

    expect(result.hue).toBeCloseTo(1 / 6, 6);
    expect(result.saturation).toBeCloseTo(1, 6);
    expect(result.lightness).toBeCloseTo(0.5, 6);
    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should clamp outside stops", () => {
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

  it("should return only color for single-stop gradient", () => {
    const sut = fixture.createSingleColorSut();

    const result = sut.sample(0.5);

    expect(result.equals(fixture.createColorA())).toBe(true);
  });
});

// ====================================================================================
// FILE: packages/core-math-colors/tests/hsl-color.test.ts
// ====================================================================================

import { describe, expect, it } from "vitest";
import { HslColor } from "../src/index.js";
import { HslColorFixture } from "./fixtures/HslColorFixture.js";
import { NewGradientStopInterpolatorFixture } from "./fixtures/NewGradientStopInterpolatorFixture.js";

describe("HslColor", () => {
  const fixture = new HslColorFixture();

  it("should create a valid HSL color", () => {
    const sut = fixture.create();

    expect(sut.hue).toBe(0.25);
    expect(sut.saturation).toBe(0.5);
    expect(sut.lightness).toBe(0.75);
    expect(sut.alpha).toBe(1);
  });

  it("should clone", () => {
    const sut = fixture.createCloneSource();

    const clone = sut.clone();

    expect(clone).not.toBe(sut);
    expect(clone.equals(sut)).toBe(true);
  });

  it("should compare equal values", () => {
    const left = fixture.createEqualLeft();
    const right = fixture.createEqualRight();

    expect(left.equals(right)).toBe(true);
  });

  it("should compare different values as not equal", () => {
    const left = fixture.createEqualLeft();
    const right = fixture.createDifferent();

    expect(left.equals(right)).toBe(false);
  });

  it("should reject invalid hue", () => {
    expect(() => HslColor.fromNormalized(-0.1, 0.5, 0.5, 1)).toThrowError(
      "HSL component 'hue' must be in range [0..1]. Received '-0.1'.",
    );
  });

  it("should reject invalid saturation", () => {
    expect(() => HslColor.fromNormalized(0.5, 1.1, 0.5, 1)).toThrowError(
      "HSL component 'saturation' must be in range [0..1]. Received '1.1'.",
    );
  });

  it("should reject invalid lightness", () => {
    expect(() => HslColor.fromNormalized(0.5, 0.5, 1.1, 1)).toThrowError(
      "HSL component 'lightness' must be in range [0..1]. Received '1.1'.",
    );
  });

  it("should reject invalid alpha", () => {
    expect(() => HslColor.fromNormalized(0.5, 0.5, 0.5, -0.1)).toThrowError(
      "HSL component 'alpha' must be in range [0..1]. Received '-0.1'.",
    );
  });
});