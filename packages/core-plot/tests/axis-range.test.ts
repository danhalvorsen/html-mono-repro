import { describe, expect, it } from "vitest";

import { AxisRange } from "../src/coordinates/axis-range.js";
import { CorePlotFixture } from "./fixtures/core-plot.fixture.js";

describe("AxisRange", () => {
  const fixture = new CorePlotFixture();

  it("should default to the canonical range", () => {
    const range = fixture.createAxisRange();

    expect(range.min).toBe(-10);
    expect(range.max).toBe(10);
    expect(range.span()).toBe(20);
  });

  it("should expose the configured span", () => {
    const range = fixture.createAxisRange(-4, 12);

    expect(range.span()).toBe(16);
  });

  it("should reject invalid ordering", () => {
    expect(() => new AxisRange(2, 2)).toThrow("AxisRange requires min < max");
    expect(() => new AxisRange(5, -1)).toThrow("AxisRange requires min < max");
  });
});
