import { describe, expect, it } from "vitest";

import { AxisIntervalScaler } from "../src/coordinates/axis-interval-scaler.js";
import { AxisRange } from "../src/coordinates/axis-range.js";

describe("AxisIntervalScaler", () => {
  it("should expand the interval when dragged to the right", () => {
    const scaler = new AxisIntervalScaler();
    const scaled = scaler.scaleFromHorizontalDrag(new AxisRange(-10, 10), 120);

    expect(scaled.min).toBeLessThan(-10);
    expect(scaled.max).toBeGreaterThan(10);
    expect(scaled.min).toBeCloseTo(-15, 0);
    expect(scaled.max).toBeCloseTo(15, 0);
  });

  it("should contract the interval below the default when dragged to the left", () => {
    const scaler = new AxisIntervalScaler();
    const scaled = scaler.scaleFromHorizontalDrag(new AxisRange(-10, 10), -96);

    expect(scaled.min).toBeGreaterThan(-10);
    expect(scaled.max).toBeLessThan(10);
    expect(scaled.span()).toBeLessThan(20);
  });

  it("should broaden more for a longer drag than for a shorter drag", () => {
    const scaler = new AxisIntervalScaler();
    const shortDrag = scaler.scaleFromHorizontalDrag(new AxisRange(-10, 10), 48);
    const longDrag = scaler.scaleFromHorizontalDrag(new AxisRange(-10, 10), 180);

    expect(longDrag.span()).toBeGreaterThan(shortDrag.span());
  });
});
