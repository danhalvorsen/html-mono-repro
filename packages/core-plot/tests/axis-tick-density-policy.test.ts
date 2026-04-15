import { describe, expect, it } from "vitest";

import { AxisRange } from "../src/coordinates/axis-range.js";
import { AxisTickDensityPolicy } from "../src/coordinates/axis-tick-density-policy.js";

describe("AxisTickDensityPolicy", () => {
  it("should use dense labels when the interval is readable", () => {
    const policy = new AxisTickDensityPolicy();
    const ticks = policy.buildVisibleTickValues(new AxisRange(-4, 4), 640);

    expect(ticks).toEqual([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
  });

  it("should reduce label density when the interval becomes too dense", () => {
    const policy = new AxisTickDensityPolicy();
    const ticks = policy.buildVisibleTickValues(new AxisRange(-50, 50), 320);

    expect(ticks.length).toBeLessThanOrEqual(8);
    expect(ticks.includes(0)).toBe(true);
  });

  it("should choose a larger major step for denser intervals", () => {
    const policy = new AxisTickDensityPolicy();
    const sparseStep = policy.selectMajorStep(new AxisRange(-10, 10), 800);
    const denseStep = policy.selectMajorStep(new AxisRange(-100, 100), 320);

    expect(denseStep).toBeGreaterThan(sparseStep);
  });
});
