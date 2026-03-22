
import { describe, expect, it } from "vitest";
 
import { NewHslColorInterpolationSpaceFixture } from "./fixtures/NewHslColorInterpolationSpaceFixture.js";
describe("NewHslColorInterpolationSpace", () => {
  const fixture = new NewHslColorInterpolationSpaceFixture();

  it("should interpolate midpoint between red and green", () => {
    const sut = fixture.createSut();

    const result = sut.interpolate(
      fixture.createRed(),
      fixture.createGreen(),
      0.5,
    );

    expect(result.hue).toBeCloseTo(1 / 6, 6);
    expect(result.saturation).toBeCloseTo(1, 6);
    expect(result.lightness).toBeCloseTo(0.5, 6);
    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should interpolate alpha", () => {
    const sut = fixture.createSut();

    const start = fixture.createRed();
    const end = fixture.createGreen();
    const startWithAlpha = start.clone();
    const endWithAlpha = end.clone();

    const result = sut.interpolate(
      startWithAlpha,
      endWithAlpha,
      0.25,
    );

    expect(result.alpha).toBeCloseTo(1, 6);
  });

  it("should wrap hue the short way around", () => {
    const sut = fixture.createSut();

    const result = sut.interpolate(
      fixture.createNearWrapStart(),
      fixture.createNearWrapEnd(),
      0.5,
    );

    expect(result.hue).toBeCloseTo(0, 6);
  });

  it("should reject invalid amount", () => {
    const sut = fixture.createSut();

    expect(() => sut.interpolate(
      fixture.createRed(),
      fixture.createGreen(),
      -0.01,
    )).toThrowError("Interpolation amount must be in range [0..1]. Received '-0.01'.");

    expect(() => sut.interpolate(
      fixture.createRed(),
      fixture.createGreen(),
      1.01,
    )).toThrowError("Interpolation amount must be in range [0..1]. Received '1.01'.");
  });
});
