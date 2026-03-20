// ====================================================================================
// SINGLE FILE: tests/all.spec.ts
// PURPOSE:
// - Full test suite (fixtures + unit tests)
// - Covers: Color, Palette, Gradient, RangeBehaviors, InterpolationSpace,
//           PaletteColorInterpolator, GradientStopInterpolator
// ====================================================================================

import { describe, expect, it } from "vitest";

// --- imports from your product code ---
import { Gradient } from "../src/gradients/Gradient.js";
import { GradientStop } from "../src/gradients/GradientStop.js";
import { Fixture } from "./fixtures/Fixture.js";

// ====================================================================================
// TESTS
// ====================================================================================

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

// ------------------------------------------------------------------------------------

describe("Palette", () => {
  const f = new Fixture();

  it("should return correct count", () => {
    const p = f.palette(["#FF0000", "#00FF00"]);
    expect(p.count).toBe(2);
  });

  it("should return item by index", () => {
    const p = f.palette(["#FF0000", "#00FF00"]);
    expect(p.getAt(1).toHexRgb()).toBe("#00FF00");
  });

  it("should reject invalid index", () => {
    const p = f.palette(["#FF0000"]);
    expect(() => p.getAt(2)).toThrow();
  });
});

// ------------------------------------------------------------------------------------

describe("Gradient", () => {
  const f = new Fixture();

  it("should sort stops", () => {
    const g = f.gradient([
      [1, "#0000FF"],
      [0, "#FF0000"],
    ]);

    expect(g.getAt(0).position).toBe(0);
  });

  it("should reject duplicate positions", () => {
    expect(() =>
      Gradient.create([
        GradientStop.create(0.5, f.color("#FF0000")),
        GradientStop.create(0.5, f.color("#00FF00")),
      ]),
    ).toThrow();
  });
});

// ------------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------------

describe("RgbColorInterpolationSpace", () => {
  const f = new Fixture();

  it("should interpolate midpoint", () => {
    const c = f.rgbSpace().interpolate(
      f.color("#000000"),
      f.color("#FFFFFF"),
      0.5,
    );

    expect(c.toHexRgb()).toBe("#808080");
  });

  it("should interpolate alpha", () => {
    const c = f.rgbSpace().interpolate(
      f.color("#FF000000"),
      f.color("#FF0000FF"),
      0.5,
    );

    expect(c.toHexRgba()).toBe("#FF000080");
  });
});

// ------------------------------------------------------------------------------------

describe("PaletteColorInterpolator", () => {
  const f = new Fixture();

  it("should return first color", () => {
    const sut = f.paletteInterpolator(["#FF0000", "#00FF00"]);
    expect(sut.sample(0).toHexRgb()).toBe("#FF0000");
  });

  it("should return last color", () => {
    const sut = f.paletteInterpolator(["#FF0000", "#00FF00"]);
    expect(sut.sample(1).toHexRgb()).toBe("#00FF00");
  });

  it("should interpolate inside segment", () => {
    const sut = f.paletteInterpolator(["#000000", "#FFFFFF"]);
    expect(sut.sample(0.5).toHexRgb()).toBe("#808080");
  });

  it("should clamp outside range", () => {
    const sut = f.paletteInterpolator(["#000000", "#FFFFFF"]);
    expect(sut.sample(-1).toHexRgb()).toBe("#000000");
    expect(sut.sample(2).toHexRgb()).toBe("#FFFFFF");
  });

  it("should sample many", () => {
    const sut = f.paletteInterpolator(["#000000", "#FFFFFF"]);

    const result = sut.sampleMany([0, 0.5, 1]).map((c: { toHexRgb: () => any; }) => c.toHexRgb());

    expect(result).toEqual(["#000000", "#808080", "#FFFFFF"]);
  });
});

// ------------------------------------------------------------------------------------

describe("GradientStopInterpolator", () => {
  const f = new Fixture();

  it("should interpolate non-uniform stops", () => {
    const sut = f.gradientInterpolator([
      [0, "#FF0000"],
      [0.2, "#00FF00"],
      [1, "#0000FF"],
    ]);

    expect(sut.sample(0.1).toHexRgb()).toBe("#808000");
  });

  it("should use correct segment", () => {
    const sut = f.gradientInterpolator([
      [0, "#FF0000"],
      [0.2, "#00FF00"],
      [1, "#0000FF"],
    ]);

    expect(sut.sample(0.6).toHexRgb()).toBe("#008080");
  });

  it("should clamp outside stops", () => {
    const sut = f.gradientInterpolator([
      [0.2, "#FF0000"],
      [0.8, "#0000FF"],
    ]);

    expect(sut.sample(0).toHexRgb()).toBe("#FF0000");
    expect(sut.sample(1).toHexRgb()).toBe("#0000FF");
  });
});