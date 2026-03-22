// ====================================================================================
// FILE: tests/color.test.ts
// PURPOSE:
// - Aligned with NEW generic pipeline + Color/HSL conversion
// ====================================================================================

import { describe, expect, it } from "vitest";
import { HslColor, NewGradient, NewGradientStop } from "../src/index.js";
import { Fixture } from "./fixtures/Fixture.js";

describe("Color", () => {
  const f = new Fixture();

  it("should parse rgb hex", () => {
    const c = f.color("#FF8000");
    expect(c.toHexRgb()).toBe("#FF8000");
  });

  it("should parse rgba hex", () => {
    const c = f.color("#33669980");
    expect(c.toHexRgba()).toBe("#33669980");
  });

  it("should format css rgba", () => {
    const c = f.color("#FF000080");
    expect(c.toCssRgba()).toBe("rgb(255 0 0 / 0.502)");
  });

  it("should reject invalid hex", () => {
    expect(() => f.color("#XYZ")).toThrow();
  });
});

describe("NewPalette", () => {
  const f = new Fixture();

  it("should return correct count", () => {
    const p = f.newPalette(["#FF0000", "#00FF00"]);
    expect(p.count).toBe(2);
  });

  it("should return item by index", () => {
    const p = f.newPalette(["#FF0000", "#00FF00"]);
    expect(f.toRgb(p.getAt(1)).toHexRgb()).toBe("#00FF00");
  });

  it("should reject invalid index", () => {
    const p = f.newPalette(["#FF0000"]);
    expect(() => p.getAt(2)).toThrow();
  });
});

describe("NewGradient", () => {
  const f = new Fixture();

  it("should sort stops", () => {
    const g = f.newGradient([
      [1, "#0000FF"],
      [0, "#FF0000"],
    ]);

    expect(g.getAt(0).position).toBe(0);
  });

  it("should reject duplicate positions", () => {
    expect(() =>
      NewGradient.create([
        NewGradientStop.create(0.5, HslColor.fromNormalized(0, 1, 0.5)),
        NewGradientStop.create(0.5, HslColor.fromNormalized(0.3, 1, 0.5)),
      ]),
    ).toThrow(/duplicate|unique/i);
  });
});

describe("Range behaviors", () => {
  const f = new Fixture();

  it("clamp should clamp", () => {
    expect(f.clamp().normalize(-1)).toBe(0);
    expect(f.clamp().normalize(2)).toBe(1);
  });

  it("wrap should wrap", () => {
    expect(f.wrap().normalize(1.25)).toBe(0.25);
    expect(f.wrap().normalize(-0.25)).toBe(0.75);
  });

  it("mirror should reflect", () => {
    expect(f.mirror().normalize(1.25)).toBe(0.75);
    expect(f.mirror().normalize(2.25)).toBe(0.25);
  });
});

describe("NewHslColorInterpolationSpace", () => {
  const f = new Fixture();

  it("should interpolate midpoint", () => {
    const c = f.hslSpace().interpolate(
      f.hsl("#000000"),
      f.hsl("#FFFFFF"),
      0.5,
    );

    expect(f.toRgb(c).toHexRgb()).toBe("#808080");
  });

  it("should interpolate alpha", () => {
    const c = f.hslSpace().interpolate(
      f.hsl("#FF000000"),
      f.hsl("#FF0000FF"),
      0.5,
    );

    expect(f.toRgb(c).toHexRgba()).toBe("#FF000080");
  });
});

describe("NewPaletteColorInterpolator", () => {
  const f = new Fixture();

  it("should return first color", () => {
    const sut = f.newPaletteInterpolator(["#FF0000", "#00FF00"]);
    expect(f.toRgb(sut.sample(0)).toHexRgb()).toBe("#FF0000");
  });

  it("should return last color", () => {
    const sut = f.newPaletteInterpolator(["#FF0000", "#00FF00"]);
    expect(f.toRgb(sut.sample(1)).toHexRgb()).toBe("#00FF00");
  });

  it("should interpolate inside segment", () => {
    const sut = f.newPaletteInterpolator(["#000000", "#FFFFFF"]);
    expect(f.toRgb(sut.sample(0.5)).toHexRgb()).toBe("#808080");
  });

  it("should clamp outside range", () => {
    const sut = f.newPaletteInterpolator(["#000000", "#FFFFFF"]);
    expect(f.toRgb(sut.sample(-1)).toHexRgb()).toBe("#000000");
    expect(f.toRgb(sut.sample(2)).toHexRgb()).toBe("#FFFFFF");
  });

  it("should sample many", () => {
    const sut = f.newPaletteInterpolator(["#000000", "#FFFFFF"]);

    const result = sut
      .sampleMany([0, 0.5, 1])
      .map((c) => f.toRgb(c).toHexRgb());

    expect(result).toEqual(["#000000", "#808080", "#FFFFFF"]);
  });
});

describe("NewGradientStopInterpolator", () => {
  const f = new Fixture();

  it("should interpolate non-uniform stops", () => {
    const sut = f.newGradientInterpolator([
      [0, "#FF0000"],
      [0.2, "#00FF00"],
      [1, "#0000FF"],
    ]);

    expect(f.toRgb(sut.sample(0.1)).toHexRgb()).toBe("#FFFF00");
  });

  it("should use correct segment", () => {
    const sut = f.newGradientInterpolator([
      [0, "#FF0000"],
      [0.2, "#00FF00"],
      [1, "#0000FF"],
    ]);

    expect(f.toRgb(sut.sample(0.6)).toHexRgb()).toBe("#00FFFF");
  });

  it("should clamp outside stops", () => {
    const sut = f.newGradientInterpolator([
      [0.2, "#FF0000"],
      [0.8, "#0000FF"],
    ]);

    expect(f.toRgb(sut.sample(0)).toHexRgb()).toBe("#FF0000");
    expect(f.toRgb(sut.sample(1)).toHexRgb()).toBe("#0000FF");
  });
});